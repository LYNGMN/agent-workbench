#!/usr/bin/env node
// ui-visual-qa runner: widths × themes (+ text 125%) with reduced motion and visible scrollbars.
// Usage: node run-ui-audit.mjs <url> [--out dir] [--widths 320,375,1280] [--themes light,dark]
//        [--theme-storage localStorageKey] [--theme-attr data-theme] [--theme-class dark | light-mode=light]
//        [--theme-eval "js using THEME"]
//        [--selector body] [--ignore sel] [--open "sel,right:sel,long:sel"] [--wait ms]
//        [--tab-stops 60] [--safe-area-bottom 0] [--icon-class lucide] [--no-text-scale] [--json]
// Exit code 1 when any check fails.
import { readFileSync, mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const auditSrc = readFileSync(join(here, 'ui-audit.js'), 'utf8');

const argv = process.argv.slice(2);
const arg = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const flag = name => argv.includes('--' + name);
const url = argv.find(a => !a.startsWith('--') && !argv[argv.indexOf(a) - 1]?.startsWith('--'));
if (!url) { console.error('usage: node run-ui-audit.mjs <url> [--out dir] …'); process.exit(2); }
const out = arg('out', join(tmpdir(), 'ui-visual-qa', new Date().toISOString().replace(/[:.]/g, '-')));
if (/(^|\/)(dist|dist-next|build|public)(\/|$)/.test(out)) { console.error(`--out must not be inside a build/asset folder: ${out}`); process.exit(2); }
const widths = arg('widths', '320,375,1280').split(',').map(Number);
const themes = arg('themes', 'light,dark').split(',');
const themeAttr = arg('theme-attr'), themeClass = arg('theme-class'), themeEval = arg('theme-eval'), themeStorage = arg('theme-storage');
const opens = (arg('open', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const wait = +arg('wait', 400), tabStops = +arg('tab-stops', 60);
const auditOpts = { root: arg('selector', 'body'), safeAreaBottom: arg('safe-area-bottom') == null ? null : +arg('safe-area-bottom') };
if (arg('ignore')) auditOpts.ignore = arg('ignore');
if (arg('icon-class')) auditOpts.iconClass = arg('icon-class');
mkdirSync(out, { recursive: true });

async function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright'].filter(Boolean);
  const npx = join(homedir(), '.npm/_npx');
  if (existsSync(npx)) for (const d of readdirSync(npx)) { const p = join(npx, d, 'node_modules/playwright/index.mjs'); if (existsSync(p)) tries.push(p); }
  for (const t of tries) { try { return await import(t); } catch {} }
  throw new Error('playwright not found — set PLAYWRIGHT_MODULE or `npm i -D playwright`');
}
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = join(homedir(), 'Library/Caches/ms-playwright');
  if (!existsSync(base)) return undefined;
  const dirs = readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
  for (const d of dirs) for (const sub of readdirSync(join(base, d))) {
    for (const app of ['Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'Chromium.app/Contents/MacOS/Chromium', 'chrome']) {
      const p = join(base, d, sub, app); if (existsSync(p)) return p;
    }
  }
}

const pw = await loadPlaywright();
const chromium = pw.chromium || pw.default?.chromium;
const launchOpts = { headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] };
let browser;
try { browser = await chromium.launch(launchOpts); }
catch (e) { const exe = findChromium(); if (!exe) throw e; browser = await chromium.launch({ ...launchOpts, executablePath: exe }); }

const passes = [];
for (const w of widths) for (const t of themes) passes.push({ width: w, theme: t, scale: 1 });
if (!flag('no-text-scale')) passes.push({ width: widths.includes(375) ? 375 : widths[0], theme: themes[0], scale: 1.25 });

async function setTheme(page, theme) {
  await page.evaluate(({ theme, themeAttr, themeClass, themeEval }) => {
    const de = document.documentElement;
    if (themeAttr) de.setAttribute(themeAttr, theme);
    if (themeClass) { const [name, when = 'dark'] = themeClass.split('='); de.classList.toggle(name, theme === when); }
    if (themeEval) new Function('THEME', themeEval)(theme);
  }, { theme, themeAttr, themeClass, themeEval });
}
const audit = (page, extra = {}) => page.evaluate(`${auditSrc}\n;uiAudit(${JSON.stringify({ ...auditOpts, ...extra })})`);

async function focusPass(page) {
  const found = [];
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
  const visited = new Set();
  for (let i = 0; i < tabStops; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const id = el.tagName + '|' + (el.id || '') + '|' + (el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30)) + '|' + Math.round(el.getBoundingClientRect().top + scrollY);
      const pick = s => [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.backgroundColor, s.borderColor, s.textDecorationLine].join(';');
      const focused = pick(getComputedStyle(el));
      const fv = el.matches(':focus-visible');
      el.blur();
      const plain = pick(getComputedStyle(el));
      el.focus({ preventScroll: true });
      const rect = el.getBoundingClientRect();
      let obscured = false;
      if (rect.width && rect.height) {
        const pts = [[rect.left + rect.width / 2, rect.top + rect.height / 2], [rect.left + 2, rect.top + 2], [rect.right - 2, rect.bottom - 2]];
        let covered = 0;
        for (const [x, y] of pts) { const top = document.elementFromPoint(x, y); if (top && !el.contains(top) && !top.contains(el)) { for (let e = top; e; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') { covered++; break; } } } }
        obscured = covered === pts.length;
      }
      const name = el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30);
      return { id, el: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${name}"`, same: focused === plain, fv, obscured };
    });
    if (!r) continue;
    if (visited.has(r.id)) break;
    visited.add(r.id);
    if (r.same) found.push({ check: 'focus', level: 'fail', el: r.el, msg: '키보드 초점 표시가 보이지 않음 (2.4.7)' });
    if (r.obscured) found.push({ check: 'focus', level: 'fail', el: r.el, msg: '초점 받은 요소가 고정 막대에 완전히 가려짐 (2.4.11)' });
  }
  return { findings: found, stops: visited.size };
}

async function openTargets(page, spec) {
  const mode = spec.startsWith('right:') ? 'right' : spec.startsWith('long:') ? 'long' : 'click';
  const sel = spec.replace(/^(right|long):/, '');
  const idx = await page.evaluate(sel => {
    const els = [...document.querySelectorAll(sel)].map((e, i) => ({ i, r: e.getBoundingClientRect() })).filter(x => x.r.width && x.r.height);
    if (!els.length) return [];
    const right = els.reduce((a, b) => (b.r.right > a.r.right ? b : a)), bottom = els.reduce((a, b) => (b.r.bottom > a.r.bottom ? b : a));
    return [...new Set([els[0].i, right.i, bottom.i])];
  }, sel);
  return idx.map(i => ({ mode, sel, i }));
}
async function trigger(page, { mode, sel, i }) {
  const loc = page.locator(sel).nth(i);
  await loc.scrollIntoViewIfNeeded();
  if (mode === 'right') await loc.click({ button: 'right' });
  else if (mode === 'long') { const b = await loc.boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up(); }
  else await loc.click();
  await page.waitForTimeout(wait);
}

const results = [];
for (const p of passes) {
  const label = `${p.width}-${p.theme}${p.scale !== 1 ? `-text${Math.round(p.scale * 100)}` : ''}`;
  const ctx = await browser.newContext({ viewport: { width: p.width, height: p.width < 768 ? 812 : 900 }, colorScheme: p.theme === 'dark' ? 'dark' : 'light', reducedMotion: 'reduce', hasTouch: p.width < 768, isMobile: false, locale: 'ko-KR' });
  if (themeStorage) await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [themeStorage, p.theme]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const prep = async () => {
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
    await setTheme(page, p.theme);
    if (p.scale !== 1) await page.evaluate(s => { document.documentElement.style.fontSize = `${s * 100}%`; }, p.scale);
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(wait);
  };
  await prep();
  const base = await audit(page);
  await page.screenshot({ path: join(out, `${label}.png`), fullPage: true });
  const focus = await focusPass(page);
  const layers = [];
  for (const spec of opens) {
    for (const target of await openTargets(page, spec)) {
      await prep();
      try {
        await trigger(page, target);
        const r = await audit(page, { layerOnly: true });
        const shot = `${label}-open-${target.mode}-${target.sel.replace(/[^\w-]+/g, '_').slice(0, 30)}-${target.i}.png`;
        await page.screenshot({ path: join(out, shot) });
        layers.push({ target, ...r, screenshot: shot });
      } catch (e) { layers.push({ target, error: e.message.split('\n')[0] }); }
    }
  }
  const baseKeys = new Set(base.findings.map(f => `${f.check}|${f.el}|${f.msg}`));
  const fresh = l => (l.findings || []).filter(f => !baseKeys.has(`${f.check}|${f.el}|${f.msg}`));
  const findings = [...base.findings, ...focus.findings, ...layers.flatMap(l => fresh(l).map(f => ({ ...f, msg: `[펼침 ${l.target.mode}:${l.target.sel}#${l.target.i}] ${f.msg}` })))];
  results.push({ pass: label, meta: base.meta, errors, tabStops: focus.stops, findings, layers: layers.map(l => ({ target: l.target, summary: l.summary, error: l.error, screenshot: l.screenshot })) });
  await ctx.close();
}
await browser.close();

// aggregate: same check+el+msg across passes
const agg = new Map();
for (const r of results) for (const f of r.findings) {
  const key = `${f.level}|${f.check}|${f.el}|${f.msg}`;
  const v = agg.get(key) || { ...f, passes: [] }; if (!v.passes.includes(r.pass)) v.passes.push(r.pass); agg.set(key, v);
}
const rows = [...agg.values()].sort((a, b) => (a.level === b.level ? a.check.localeCompare(b.check) : a.level === 'fail' ? -1 : 1));
const fails = rows.filter(r => r.level === 'fail').length, warns = rows.length - fails;
const pageErrors = results.flatMap(r => r.errors.map(e => `${r.pass}: ${e}`));
writeFileSync(join(out, 'report.json'), JSON.stringify({ url, passes: results, aggregated: rows }, null, 2));
const md = [
  `# UI 검수 결과`, '', `- 주소: ${url}`, `- 실행: ${results.map(r => r.pass).join(', ')}`, `- 실패 ${fails}건 · 경고 ${warns}건${pageErrors.length ? ` · 페이지 오류 ${pageErrors.length}건` : ''}`, '',
  '| 수준 | 검사 | 요소 | 내용 | 실행 |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.level === 'fail' ? '실패' : '경고'} | ${r.check} | ${String(r.el).replace(/\|/g, '\\|')} | ${r.msg.replace(/\|/g, '\\|')} | ${r.passes.length === results.length ? '전체' : r.passes.join(', ')} |`),
  ...(pageErrors.length ? ['', '## 페이지 오류', ...pageErrors.map(e => `- ${e}`)] : []),
].join('\n');
writeFileSync(join(out, 'report.md'), md);
if (flag('json')) console.log(JSON.stringify({ out, fails, warns, rows }, null, 2));
else console.log(md + `\n\n결과 폴더: ${out}`);
process.exit(fails ? 1 : 0);
