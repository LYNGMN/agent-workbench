#!/usr/bin/env node
// Optical balance of an icon group (see references/icon-consistency.md, '광학 균형').
// Usage: node measure-icon-optics.mjs <url> --selector ".toolbar button" [--ref search] [--width 375] [--height 812]
//        [--diagonal close,external] [--eval "js run after load, may await"] [--wait 400] [--json]
// Prints one row per icon: ink box, hull and ink area, centroid and optical-centre offsets and visible size against --ref
// (a data-icon / aria-label name or an index, default the first). Exit code 1 when an icon is off by more than 5% in
// size (diagonal-only glyphs named by --diagonal: from 0.93) or 0.5px in centre.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const url = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const selector = arg('selector');
if (!url || !selector) { console.error('usage: node measure-icon-optics.mjs <url> --selector "<css>" [--ref name]'); process.exit(2); }
const refArg = arg('ref', '0'), ref = /^\d+$/.test(refArg) ? +refArg : refArg;

async function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright'].filter(Boolean);
  const npx = join(homedir(), '.npm/_npx');
  if (existsSync(npx)) for (const d of readdirSync(npx)) { const p = join(npx, d, 'node_modules/playwright/index.mjs'); if (existsSync(p)) tries.push(p); }
  for (const t of tries) { try { return await import(t); } catch {} }
  throw new Error('playwright not found — set PLAYWRIGHT_MODULE or `npm i -D playwright`');
}
function chromiumPaths() {
  if (process.env.CHROMIUM_PATH) return [process.env.CHROMIUM_PATH];
  const base = join(homedir(), 'Library/Caches/ms-playwright');
  if (!existsSync(base)) return [];
  const found = [];
  for (const d of readdirSync(base).filter(d => /^chromium(_headless_shell)?-\d+$/.test(d)).sort((a, b) => +b.split('-').pop() - +a.split('-').pop()))
    for (const sub of readdirSync(join(base, d)))
      for (const app of ['chrome-headless-shell', 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'Chromium.app/Contents/MacOS/Chromium', 'chrome']) {
        const p = join(base, d, sub, app); if (existsSync(p)) found.push(p);
      }
  return found;
}

const pw = await loadPlaywright();
const chromium = pw.chromium || pw.default?.chromium;
let browser;
try { browser = await chromium.launch(); }
catch (error) {
  for (const executablePath of chromiumPaths()) { try { browser = await chromium.launch({ executablePath }); break; } catch {} }
  if (!browser) throw error;
}
const page = await browser.newPage({ viewport: { width: +arg('width', 375), height: +arg('height', 812) } });
await page.goto(url, { waitUntil: 'load' });
if (arg('eval')) await page.evaluate(`(async () => { ${arg('eval')} })()`);
await page.waitForTimeout(+arg('wait', 400));
await page.addScriptTag({ content: readFileSync(join(here, 'icon-optics.js'), 'utf8') });
const rows = await page.evaluate(([selector, ref]) => window.iconOptics({ selector, ref }), [selector, ref]);
await browser.close();

const diagonal = new Set((arg('diagonal', '') || '').split(',').filter(Boolean));
const bad = rows.filter(row => Math.abs(row.size - (diagonal.has(row.name) ? .93 : 1)) > .05 || Math.abs(row.oxPx) > .5 || Math.abs(row.oyPx) > .5);
if (argv.includes('--json')) console.log(JSON.stringify({ rows, bad: bad.map(row => row.name) }, null, 2));
else { console.table(rows); console.log(bad.length ? `off: ${bad.map(row => row.name).join(', ')}` : 'all icons within ±5% size and 0.5px centre'); }
process.exit(bad.length ? 1 : 0);
