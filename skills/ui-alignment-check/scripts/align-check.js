// align-check.js — measure icon/text centering, spacing and wrapping from inside the page.
// Paste into the page (browser console, Playwright page.evaluate, Puppeteer) and call alignCheck().
// Returns { summary:{fail,warn}, findings:[{check, level, el, msg, data}] }. Numbers are CSS px.
// Checks: center (content vs button centre), row (siblings' vertical centres), gap (overlap / too tight),
//         label (name wraps to a second line), iconset (mixed size/stroke inside one group).
function alignCheck({ tol = 0.5, minGap = 2, goodGap = 8, root = document } = {}) {
  const findings = [];
  const r1 = n => Math.round(n * 100) / 100;
  const desc = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') +
    (el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label').slice(0, 20)}]` : '');
  const add = (check, level, el, msg, data) => findings.push({ check, level, el: desc(el), msg, data });

  const visible = el => {
    const s = getComputedStyle(el), b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };
  // screen-reader-only text (1px / clipped) must not count as visible content
  const srOnly = el => {
    const s = getComputedStyle(el), b = el.getBoundingClientRect();
    return (b.width <= 1 && b.height <= 1) || s.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%\)/.test(s.clipPath);
  };
  const controls = [...root.querySelectorAll('button,[role=button],[role=tab],[role=menuitem],a[href],summary,input[type=button],input[type=submit]')]
    .filter(visible);

  // union of the rects of everything the eye sees inside the control: svg, img, text glyphs
  const contentBox = el => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const take = b => { if (b.width <= 0 && b.height <= 0) return; x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); };
    const walk = node => {
      if (node.nodeType === 3) {
        if (!node.textContent.trim()) return;
        const range = document.createRange(); range.selectNodeContents(node);
        [...range.getClientRects()].forEach(take);
      } else if (node.nodeType === 1 && visible(node) && !srOnly(node)) {
        if (/^(svg|img|canvas|video)$/i.test(node.tagName)) take(node.getBoundingClientRect());
        else [...node.childNodes].forEach(walk);
      }
    };
    [...el.childNodes].forEach(walk);
    return x1 > x0 ? { left: x0, top: y0, right: x1, bottom: y1 } : null;
  };

  for (const el of controls) {
    const box = el.getBoundingClientRect(), c = contentBox(el);
    if (!c) continue;
    const dx = (c.left + c.right) / 2 - (box.left + box.right) / 2;
    const dy = (c.top + c.bottom) / 2 - (box.top + box.bottom) / 2;
    const s = getComputedStyle(el);
    const iconOnly = !el.textContent.trim();
    // left-aligned rows (menu items, list rows) only have to be centred vertically
    const leftAligned = !iconOnly && (/start|left/.test(s.justifyContent) || /^(left|start)$/.test(s.textAlign)) && !/center/.test(s.justifyContent);
    const data = { dx: r1(dx), dy: r1(dy) };
    if (!leftAligned && Math.abs(dx) > tol) add('center', 'fail', el, `content is ${r1(dx)}px off horizontally`, data);
    if (Math.abs(dy) > tol) add('center', 'fail', el, `content is ${r1(dy)}px off vertically`, data);
  }

  // siblings in one row (title + close button, label + stepper): vertical centres must agree
  const seenRows = new Set();
  for (const el of controls) {
    const p = el.parentElement;
    if (!p || seenRows.has(p)) continue;
    seenRows.add(p);
    const s = getComputedStyle(p);
    if (!/flex|grid/.test(s.display) || s.flexDirection.startsWith('column')) continue;
    const kids = [...p.children].filter(k => visible(k) && !srOnly(k));
    if (kids.length < 2) continue;
    const centres = kids.map(k => { const b = k.getBoundingClientRect(); return (b.top + b.bottom) / 2; });
    const spread = Math.max(...centres) - Math.min(...centres);
    const sameLine = kids.every(k => Math.abs(k.getBoundingClientRect().top - kids[0].getBoundingClientRect().top) < kids[0].getBoundingClientRect().height);
    if (sameLine && spread > tol && !/baseline|flex-start|start/.test(s.alignItems)) add('row', 'warn', p, `children's vertical centres differ by ${r1(spread)}px`, { spread: r1(spread) });
  }

  // spacing between controls: overlap / touching are never OK
  for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) {
    const a = controls[i], b = controls[j];
    if (a.contains(b) || b.contains(a)) continue;
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    const gx = Math.max(B.left - A.right, A.left - B.right), gy = Math.max(B.top - A.bottom, A.top - B.bottom);
    const gap = Math.max(gx, gy);
    if (gx < 0 && gy < 0) add('gap', 'fail', a, `overlaps ${desc(b)}`, { with: desc(b) });
    else if (gap < minGap && Math.min(gx, gy) < 0) add('gap', 'fail', a, `only ${r1(gap)}px from ${desc(b)}`, { gap: r1(gap) });
    else if (gap < goodGap && Math.min(gx, gy) < 0) add('gap', 'warn', a, `${r1(gap)}px from ${desc(b)} (aim for ${goodGap}px)`, { gap: r1(gap) });
  }

  // names that wrap to two lines
  for (const el of controls) {
    if (el.hasAttribute('data-qa-multiline')) continue;
    const range = document.createRange(); range.selectNodeContents(el);
    const tops = new Set([...range.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top / 4)));
    if (tops.size > 1 && el.textContent.trim()) add('label', 'fail', el, `"${el.textContent.trim().slice(0, 24)}" wraps onto ${tops.size} lines`, { lines: tops.size });
  }

  // icon consistency inside one group
  const groups = new Map();
  for (const el of controls) {
    const svg = el.querySelector('svg'); if (!svg) continue;
    const p = el.parentElement; if (!groups.has(p)) groups.set(p, []);
    const b = svg.getBoundingClientRect(), s = getComputedStyle(svg.querySelector('path,line,circle,rect') || svg);
    groups.get(p).push({ el, w: r1(b.width), h: r1(b.height), stroke: s.strokeWidth, fill: s.fill !== 'none' && s.stroke === 'none' });
  }
  for (const [p, list] of groups) {
    if (list.length < 2) continue;
    const key = o => `${o.w}x${o.h}`, sizes = new Set(list.map(key)), strokes = new Set(list.map(o => o.stroke)), fills = new Set(list.map(o => o.fill));
    if (sizes.size > 1) add('iconset', 'fail', p, `icon sizes differ in one group: ${[...sizes].join(', ')}`, { sizes: [...sizes] });
    if (strokes.size > 1) add('iconset', 'warn', p, `stroke widths differ: ${[...strokes].join(', ')}`, { strokes: [...strokes] });
    if (fills.size > 1) add('iconset', 'warn', p, 'filled and outline icons mixed', {});
  }

  const summary = { fail: findings.filter(f => f.level === 'fail').length, warn: findings.filter(f => f.level === 'warn').length, controls: controls.length };
  return { summary, findings };
}
if (typeof window !== 'undefined') window.alignCheck = alignCheck;
