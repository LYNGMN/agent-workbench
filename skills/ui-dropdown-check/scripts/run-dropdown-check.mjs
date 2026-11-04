#!/usr/bin/env node
// Run dropdown-check.js at 320 / 375 / 1280 px in light and dark and print every finding. --open clicks the trigger(s) first so the open list is measured.
// Usage: node run-dropdown-check.mjs <url-or-file> [--out shots/] [--open "<selector>"] [--theme-storage <localStorage key>] [--theme-attr data-theme]
// Needs Playwright (`npm i -D playwright && npx playwright install chromium`); set CHROMIUM_PATH to use an existing Chromium. Exit code 1 if any 'fail'.
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = name => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : undefined; };
const target = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
if (!target) { console.error('usage: node run-dropdown-check.mjs <url-or-file> [--out dir] [--open selector] [--theme-storage key] [--theme-attr attr]'); process.exit(2); }
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(resolve(target)).href;
const out = arg('out'); if (out) mkdirSync(out, { recursive: true });
const { chromium } = await import('playwright');
const script = readFileSync(join(here, 'dropdown-check.js'), 'utf8');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failed = 0;
for (const theme of ['light', 'dark']) for (const width of [320, 375, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 812 }, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  if (arg('theme-storage')) await page.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [arg('theme-storage'), theme]);
  await page.goto(url, { waitUntil: 'load' });
  if (arg('theme-attr')) await page.evaluate(([a, v]) => document.documentElement.setAttribute(a, v), [arg('theme-attr'), theme]);
  await page.waitForTimeout(300);
  if (arg('open')) { const els = page.locator(arg('open')); if (await els.count()) await els.last().click().catch(() => {}); await page.waitForTimeout(200); }
  await page.addScriptTag({ content: script });
  const result = await page.evaluate(() => window.dropdownCheck());
  console.log(`\n== ${theme} ${width}px — fail ${result.summary.fail}, warn ${result.summary.warn}, selects ${result.summary.selects}, open lists ${result.summary.panels}`);
  for (const f of result.findings) console.log(`  [${f.level}] ${f.check} ${f.el}: ${f.msg}`);
  failed += result.summary.fail;
  if (out) await page.screenshot({ path: join(out, `${theme}-${width}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
