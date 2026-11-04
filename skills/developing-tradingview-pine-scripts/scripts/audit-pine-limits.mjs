#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const HARD_LIMIT = 64;
const DEFAULT_RESERVE = 8;
const trackedCalls = new Set([
  "alertcondition",
  "barcolor",
  "bgcolor",
  "box.new",
  "fill",
  "hline",
  "label.new",
  "line.new",
  "plot",
  "plotarrow",
  "plotbar",
  "plotcandle",
  "plotchar",
  "plotshape",
  "polyline.new",
  "table.new",
]);

function usage() {
  return "Usage: node audit-pine-limits.mjs [--json] [--reserve N] <script.pine>";
}

function parseArguments(argv) {
  let json = false;
  let reserve = DEFAULT_RESERVE;
  let file;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--json") json = true;
    else if (value === "--reserve") {
      reserve = Number(argv[index + 1]);
      index += 1;
    } else if (value === "--help" || value === "-h") {
      console.log(usage());
      process.exit(0);
    } else if (!file) file = value;
    else throw new Error(`Unexpected argument: ${value}`);
  }
  if (!file) throw new Error(usage());
  if (!Number.isInteger(reserve) || reserve < 0 || reserve >= HARD_LIMIT) {
    throw new Error("--reserve must be an integer from 0 to 63");
  }
  return { file, json, reserve };
}

function readCall(source, openingIndex) {
  let depth = 1;
  let inString = false;
  let escaped = false;
  let index = openingIndex + 1;
  for (; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (!inString && char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
    } else if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        return { argumentsText: source.slice(openingIndex + 1, index), end: index };
      }
    }
  }
  throw new Error(`Unclosed function call at source offset ${openingIndex}`);
}

function findCalls(source) {
  const calls = [];
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (!inString && char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
    } else if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (/[A-Za-z_]/.test(char)) {
      let end = index + 1;
      while (end < source.length && /[A-Za-z0-9_.]/.test(source[end])) end += 1;
      const name = source.slice(index, end);
      let opening = end;
      while (/\s/.test(source[opening] ?? "")) opening += 1;
      if (trackedCalls.has(name) && source[opening] === "(") {
        const call = readCall(source, opening);
        calls.push({ name, argumentsText: call.argumentsText });
        index = call.end;
      } else index = end - 1;
    }
  }
  return calls;
}

function splitArguments(text) {
  const values = [];
  let start = 0;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if ("([{".includes(char)) depth += 1;
    else if (")]}".includes(char)) depth -= 1;
    else if (char === "," && depth === 0) {
      values.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  values.push(text.slice(start).trim());
  return values.filter(Boolean);
}

function parseCallArguments(text) {
  const named = new Map();
  const positional = [];
  for (const argument of splitArguments(text)) {
    const match = argument.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/);
    if (match) named.set(match[1], match[2].trim());
    else positional.push(argument);
  }
  return { named, positional };
}

function isConstColor(expression) {
  const value = expression.trim();
  if (value === "na") return true;
  if (/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/.test(value)) return true;
  if (/^color\.[A-Za-z_][A-Za-z0-9_]*$/.test(value)) return true;
  return /^color\.new\(\s*(?:color\.[A-Za-z_][A-Za-z0-9_]*|#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?)\s*,\s*\d+(?:\.\d+)?\s*\)$/.test(value);
}

function possibleDynamicColors(args, parameters) {
  return parameters.reduce((total, [name, position]) => {
    const expression = args.named.get(name) ?? args.positional[position];
    return total + (expression && !isConstColor(expression) ? 1 : 0);
  }, 0);
}

function plotRange(call) {
  const args = parseCallArguments(call.argumentsText);
  if (call.name === "plot") return [1, 1 + possibleDynamicColors(args, [["color", 2]])];
  if (call.name === "plotarrow") return [1, 1 + possibleDynamicColors(args, [["colorup", 2], ["colordown", 3]])];
  if (call.name === "plotbar") return [4, 4 + possibleDynamicColors(args, [["color", 5]])];
  if (call.name === "plotcandle") {
    return [4, 4 + possibleDynamicColors(args, [["color", 5], ["wickcolor", 6], ["bordercolor", 9]])];
  }
  if (call.name === "plotchar" || call.name === "plotshape") {
    return [1, 1 + possibleDynamicColors(args, [["color", 4], ["textcolor", 7]])];
  }
  if (["alertcondition", "barcolor", "bgcolor"].includes(call.name)) return [1, 1];
  if (call.name === "fill") {
    const expression = args.named.get("color") ?? args.positional[2];
    return expression && !isConstColor(expression) ? [0, 1] : [0, 0];
  }
  return [0, 0];
}

function lexicalTokenProxy(source) {
  const code = source
    .replace(/\/\/.*$/gm, "")
    .replace(/"(?:\\.|[^"\\])*"/g, "S");
  return (code.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|:=|=>|==|!=|<=|>=|\?\?|[()[\]{},.:?+\-*\/<>=]/g) ?? []).length;
}

function buildReport(file, source, reserve) {
  const found = findCalls(source);
  const calls = {};
  let minimum = 0;
  let maximum = 0;
  for (const call of found) {
    calls[call.name] = (calls[call.name] ?? 0) + 1;
    const [lower, upper] = plotRange(call);
    minimum += lower;
    maximum += upper;
  }
  const sortedCalls = Object.fromEntries(Object.entries(calls).sort(([left], [right]) => left.localeCompare(right)));
  const recommendedCeiling = HARD_LIMIT - reserve;
  const status = maximum > HARD_LIMIT
    ? "over-hard-limit"
    : maximum > recommendedCeiling
      ? "inside-limit-without-reserve"
      : "inside-recommended-budget";
  return {
    file: path.resolve(file),
    hardLimit: HARD_LIMIT,
    recommendedReserve: reserve,
    recommendedCeiling,
    plotCounts: {
      minimum,
      maximum,
      headroomAtMaximum: HARD_LIMIT - maximum,
    },
    status,
    calls: sortedCalls,
    estimateOnly: true,
    tokenProxy: {
      value: lexicalTokenProxy(source),
      note: "Source lexical comparison proxy; not TradingView compiler IL tokens.",
    },
  };
}

function printHuman(report) {
  console.log(`Pine limit audit: ${report.file}`);
  console.log(`Plot estimate: ${report.plotCounts.minimum}-${report.plotCounts.maximum} / ${report.hardLimit}`);
  console.log(`Recommended reserve: ${report.recommendedReserve} (review above ${report.recommendedCeiling})`);
  console.log(`Status: ${report.status}`);
  console.log(`Source token proxy: ${report.tokenProxy.value} (${report.tokenProxy.note})`);
  console.log("Calls:");
  for (const [name, count] of Object.entries(report.calls)) console.log(`  ${name}: ${count}`);
}

try {
  const options = parseArguments(process.argv.slice(2));
  const source = await readFile(options.file, "utf8");
  const report = buildReport(options.file, source, options.reserve);
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);
  if (report.plotCounts.maximum > HARD_LIMIT) process.exitCode = 2;
} catch (error) {
  console.error(`Pine limit audit failed: ${error.message}`);
  process.exitCode = 1;
}
