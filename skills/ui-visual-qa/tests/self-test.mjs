#!/usr/bin/env node
// Regression test for the audit itself: bad.html must trip every check, good.html must have 0 fails.
// Usage: node tests/self-test.mjs   (env PLAYWRIGHT_MODULE / CHROMIUM_PATH are passed through)
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const runner = join(here, '../scripts/run-ui-audit.mjs');
const run = name => {
  const out = join(tmpdir(), 'ui-visual-qa-self-test', name);
  let stdout;
  try { stdout = execFileSync('node', [runner, `file://${join(here, name + '.html')}`, '--out', out, '--theme-attr', 'data-theme', '--open', '#more', '--json'], { encoding: 'utf8', maxBuffer: 1 << 26 }); }
  catch (e) { stdout = e.stdout; }
  return JSON.parse(stdout);
};

const bad = run('bad');
const has = (check, re) => bad.rows.some(r => r.level === 'fail' && r.check === check && re.test(r.msg));
const expected = [
  ['center', /가로로/], ['center', /제목 .*세로 중심/], ['overlap', /겹침/], ['row', /폭이 제각각/],
  ['label', /2줄/], ['break', /조사\) 중간/], ['contrast', /글자 대비/], ['contrast', /아이콘 대비/],
  ['clipped', /잘림/], ['offscreen', /화면 밖/], ['offscreen', /펼친 층/], ['offscreen', /안전 영역/], ['overflow', /가로로/],
  ['icon', /선 굵기/], ['icon', /선형·채움/], ['icon', /글자 기호/], ['icon', /같은 이름/],
  ['a11y', /lang/], ['a11y', /이름 없음/], ['a11y', /키보드로 갈 수 없는/], ['a11y', /숨긴 조작/], ['focus', /초점 표시/],
];
const missing = expected.filter(([c, re]) => !has(c, re));
assert.deepEqual(missing.map(([c, re]) => `${c} ${re}`), [], 'bad.html: every defect is reported');
assert.ok(bad.rows.some(r => r.check === 'scroll'), 'bad.html: default scrollbar warned');

const good = run('good');
assert.deepEqual(good.rows.filter(r => r.level === 'fail').map(r => `${r.check}: ${r.el} ${r.msg}`), [], 'good.html: no fails');
console.log(`self-test ok — bad: ${bad.fails} fails / ${bad.warns} warns, good: 0 fails / ${good.warns} warns`);

// Scroll areas: a long form in an 85dvh bottom sheet, scrolled so a row passes under the sticky header, is reached by
// scrolling (0 fails; the audit before this rule failed it 3 times), while defects scrolling cannot reach still fail.
const sheet = run('scroll-sheet');
assert.deepEqual(sheet.rows.filter(r => r.level === 'fail').map(r => `${r.check}: ${r.el} ${r.msg}`), [], 'scroll-sheet.html: no fails');
const sheetBad = run('scroll-sheet-bad');
const sheetHas = (check, re) => sheetBad.rows.some(r => r.level === 'fail' && r.check === check && re.test(`${r.el} ${r.msg}`));
const sheetExpected = [
  ['offscreen', /나중에.*고정 요소의 내용이 화면 아래로/], ['offscreen', /panel.*스크롤 상자가 화면 아래로/],
  ['offscreen', /low.*스크롤 상자의 끝이 하단 안전 영역/], ['overlap', /첫째.*둘째.*겹침/], ['overlap', /셋째.*넷째.*겹침/],
];
assert.deepEqual(sheetExpected.filter(([c, re]) => !sheetHas(c, re)).map(([c, re]) => `${c} ${re}`), [], 'scroll-sheet-bad.html: every defect is reported');
console.log(`scroll area self-test ok — scroll-sheet: 0 fails, scroll-sheet-bad: ${sheetBad.fails} fails`);

// Optical balance: the Lucide set as drawn is off, the corrected set passes (references/icon-consistency.md).
const optics = name => { try { execFileSync('node', [join(here, '../scripts/measure-icon-optics.mjs'), `file://${join(here, name + '.html')}`, '--selector', 'button', '--ref', 'search', '--diagonal', 'close', '--json'], { encoding: 'utf8' }); return 0; } catch (e) { return e.status; } };
assert.equal(optics('optics-bad'), 1, 'optics-bad.html: unbalanced icons are reported');
assert.equal(optics('optics-good'), 0, 'optics-good.html: balanced icons pass');
// The same shape at the same screen size in viewBox 24 / 26.667 / 60 must measure size 1.00 (screen px, not viewBox units).
const sizes = JSON.parse(execFileSync('node', [join(here, '../scripts/measure-icon-optics.mjs'), `file://${join(here, 'optics-viewbox.html')}`, '--selector', 'button', '--ref', 'lucide-24', '--json'], { encoding: 'utf8' })).rows;
assert.equal(sizes.length, 3, 'optics-viewbox.html: three icons measured');
for (const row of sizes) assert.ok(Math.abs(row.size - 1) <= 0.02, `optics-viewbox.html: ${row.name} size ${row.size} should be 1.00 regardless of viewBox`);
console.log('icon optics self-test passed');
