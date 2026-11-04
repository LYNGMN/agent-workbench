// ui-visual-qa: in-page layout/theme/wrapping/icon/scroll/a11y audit.
// Self-contained. Paste into a page (DevTools, javascript_tool, page.evaluate) and call uiAudit({...}).
// Returns {meta, summary, counts, findings:[{check, level:'fail'|'warn', el, msg, data}]}.
globalThis.uiAudit = function uiAudit(opts = {}) {
  const o = {
    root: 'body',
    ignore: '[data-qa-ignore]',
    iconAllow: '[data-icon-allow], [class*="logo"], [class*="brand"]',
    iconClass: null, // e.g. 'lucide' — when set, svgs without this class are warned
    centerTol: 0.5, gapMin: 2, edgeGap: 8, target: 24, targetProject: 44,
    labelMaxChars: 24, maxPerCheck: 40, safeAreaBottom: null, layerOnly: false,
    ...opts,
  };
  const rootEl = document.querySelector(o.root) || document.body;
  const de = document.documentElement;
  const vw = de.clientWidth, vh = window.innerHeight;
  const cover = /viewport-fit\s*=\s*cover/.test(document.querySelector('meta[name="viewport"]')?.content || '');
  const safeBottom = o.safeAreaBottom ?? (cover && vw < 768 ? 34 : 0);
  const findings = [], counts = {};
  const add = (check, level, el, msg, data) => {
    counts[check] ??= { fail: 0, warn: 0 };
    counts[check][level]++;
    if (findings.filter(f => f.check === check).length < o.maxPerCheck) findings.push({ check, level, el: el ? describe(el) : null, msg, data });
  };
  const r1 = n => Math.round(n * 10) / 10;

  // ---------- helpers ----------
  function describe(el) {
    if (!(el instanceof Element)) return String(el);
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    if (cls.length) s += '.' + cls.join('.');
    const name = el !== document.documentElement && el !== document.body && (el.matches?.(CONTROL) || el.childElementCount <= 2) ? accName(el).slice(0, 30) : '';
    if (name) s += ` "${name}"`;
    return s;
  }
  const ignored = el => !!(o.ignore && el.closest(o.ignore)) || !!el.closest('[inert], [aria-hidden="true"]:not(svg)');
  function visible(el) {
    if (!el.isConnected) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    if (el.checkVisibility) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true });
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0;
  }
  function srOnly(el) {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return (r.width <= 1 && r.height <= 1) || s.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%\)/.test(s.clipPath);
  }
  function textOf(el) {
    let t = '';
    const walk = n => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) t += c.nodeValue;
        else if (c.nodeType === 1 && c.getAttribute('aria-hidden') !== 'true' && !/^(svg|style|script|template|noscript)$/i.test(c.tagName)) walk(c);
      }
    };
    walk(el);
    return t.replace(/\s+/g, ' ').trim();
  }
  function accName(el) {
    const lb = el.getAttribute?.('aria-labelledby');
    if (lb) { const t = lb.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim(); if (t) return t; }
    const al = el.getAttribute?.('aria-label'); if (al && al.trim()) return al.trim();
    if (el.tagName === 'IMG') return (el.getAttribute('alt') || '').trim();
    if (el.tagName === 'INPUT' && el.labels?.length) return el.labels[0].textContent.trim();
    const t = textOf(el); if (t) return t;
    const imgAlt = [...el.querySelectorAll?.('img[alt]') || []].map(i => i.alt).join(' ').trim(); if (imgAlt) return imgAlt;
    const svgTitle = el.querySelector?.('svg title')?.textContent?.trim(); if (svgTitle) return svgTitle;
    return (el.getAttribute?.('title') || '').trim();
  }
  // CSS color (any syntax incl. oklch/color()) -> [r,g,b,a 0..1]
  const ctx = (() => { const c = document.createElement('canvas'); c.width = c.height = 1; return c.getContext('2d', { willReadFrequently: true }); })();
  const colorCache = new Map();
  function rgba(str) {
    if (!str || str === 'transparent') return [0, 0, 0, 0];
    if (colorCache.has(str)) return colorCache.get(str);
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = str; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const v = [d[0], d[1], d[2], d[3] / 255]; // getImageData is already un-premultiplied
    colorCache.set(str, v); return v;
  }
  const over = (top, bottom) => { const a = top[3]; return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1]; };
  function bgOf(el) { // composited opaque background behind el, or null when an image/gradient makes it unknown
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage !== 'none') return null;
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 0.999) break; }
    }
    let base = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  }
  function opacityChain(el) { let a = 1; for (let e = el; e; e = e.parentElement) a *= +getComputedStyle(e).opacity; return a; }
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  function textRects(el) { // per-line rects of visible text inside el
    const rects = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!n.nodeValue.trim() || n.parentElement.closest('svg, [aria-hidden="true"]') && !el.closest('svg')) continue;
      { // screen-reader-only text (1×1 clip, clip rect(0…), inset(50%)) is not on screen: skip it
        let hidden = false;
        for (let e = n.parentElement; e && e !== el.parentElement; e = e.parentElement) if (srOnly(e)) { hidden = true; break; }
        if (hidden) continue;
      }
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 0.5 && r.height > 0) rects.push(r);
    }
    return rects;
  }
  function lineCount(rects) {
    const tops = [];
    for (const r of [...rects].sort((a, b) => a.top - b.top)) if (!tops.some(t => Math.abs(t - r.top) < r.height / 2)) tops.push(r.top);
    return tops.length;
  }
  const union = rs => rs.length ? rs.reduce((u, r) => ({ left: Math.min(u.left, r.left), top: Math.min(u.top, r.top), right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }) : null;
  // Scroll areas (sheets, panels, dialogs with overflow-y:auto): what lies outside their visible part is reached by scrolling.
  const scrollsY = e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1;
  const scrollsAny = e => { const s = getComputedStyle(e); return (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1) || (/(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1); };
  const portOf = e => { const r = e.getBoundingClientRect(); return { left: r.left + e.clientLeft, top: r.top + e.clientTop, right: r.left + e.clientLeft + e.clientWidth, bottom: r.top + e.clientTop + e.clientHeight }; };
  const scrollBoxOf = el => { for (let e = el.parentElement; e && e !== de && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (/(auto|scroll|hidden)/.test(s.overflowX + s.overflowY)) return e; if (s.position === 'fixed') return null; } return null; };

  const CONTROL = 'button, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="switch"], [role="checkbox"], [role="radio"], a[href], summary, select, textarea, input:not([type="hidden"])';
  const BUTTONISH = 'button, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], summary, input[type="button"], input[type="submit"], a[href][class*="btn"], a[href][class*="button"]';
  const LAYER = 'dialog, [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="tooltip"], [popover], [data-qa-layer]';
  const scope = el => rootEl.contains(el) && !ignored(el);
  const all = sel => [...rootEl.querySelectorAll(sel)].filter(e => scope(e) && visible(e) && !srOnly(e));
  let controls = all(CONTROL);
  if (o.layerOnly) controls = controls.filter(c => c.closest(LAYER));
  const outerControls = controls.filter(c => !controls.some(p => p !== c && p.contains(c)));
  const buttons = all(BUTTONISH).filter(b => !o.layerOnly || b.closest(LAYER));
  const isIconOnly = b => !textOf(b) && !!b.querySelector('svg, img');

  // ---------- 1. center: content centered inside buttons ----------
  for (const b of buttons) {
    const s = getComputedStyle(b);
    const parts = [...b.querySelectorAll('svg, img')].filter(visible).filter(e => !e.parentElement.closest('svg')).map(e => e.getBoundingClientRect());
    const tr = textRects(b);
    if (lineCount(tr) > 1) continue; // wrapping handled by label check
    const content = union([...parts, ...tr]);
    if (!content) continue;
    const br = b.getBoundingClientRect();
    const bl = parseFloat(s.borderLeftWidth), brw = parseFloat(s.borderRightWidth), bt = parseFloat(s.borderTopWidth), bb = parseFloat(s.borderBottomWidth);
    const cx = (br.left + bl + br.right - brw) / 2, cy = (br.top + bt + br.bottom - bb) / 2;
    const dx = (content.left + content.right) / 2 - cx, dy = (content.top + content.bottom) / 2 - cy;
    const centeredX = isIconOnly(b) || /center/.test(s.justifyContent) || (s.display.includes('block') && s.textAlign === 'center') || b.tagName === 'BUTTON' && !/flex|grid/.test(s.display) && s.textAlign === 'center';
    if (centeredX && Math.abs(dx) > o.centerTol) add('center', 'fail', b, `내용이 가로로 ${r1(dx)}px 어긋남`, { dx: r1(dx), dy: r1(dy) });
    if (Math.abs(dy) > o.centerTol) add('center', 'fail', b, `내용이 세로로 ${r1(dy)}px 어긋남`, { dx: r1(dx), dy: r1(dy) });
  }
  // header title vs adjacent button vertical centers
  for (const h of all('h1, h2, h3, h4, [role="heading"], [class*="title"]')) {
    const row = h.parentElement; if (!row) continue;
    const rs = getComputedStyle(row);
    if (!/flex|grid/.test(rs.display) || rs.flexDirection?.startsWith('column')) continue;
    const tr = textRects(h); if (lineCount(tr) !== 1) continue;
    const t = union(tr), tc = (t.top + t.bottom) / 2;
    for (const sib of [...row.children].filter(c => c !== h && visible(c) && (c.matches(BUTTONISH) || c.querySelector(BUTTONISH)))) {
      const btn = sib.matches(BUTTONISH) ? sib : sib.querySelector(BUTTONISH);
      const r = btn.getBoundingClientRect(), d = (r.top + r.bottom) / 2 - tc;
      if (Math.abs(r.top - t.top) < 80 && Math.abs(d) > o.centerTol) add('center', 'fail', btn, `제목 "${textOf(h).slice(0, 20)}"과 세로 중심이 ${r1(d)}px 어긋남`, { d: r1(d) });
    }
  }

  // ---------- 2. overlap / gap between controls (same layer only) ----------
  const layerOf = el => el.closest(LAYER) || (() => { for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).position === 'fixed') return e; return null; })();
  // Only what a person sees together counts (references/scrolling.md '스크롤 상자 안'). Controls in one scroll area move
  // together, so their overlap counts wherever they are scrolled; against a control outside that area only the part inside
  // its visible area counts. Content passing under a full-width sticky header/footer (or beside a sticky column) of its own
  // scroll area is not compared with the controls in that sticky bar.
  const boxes = outerControls.filter(c => !c.closest('[role="menu"], [role="listbox"]') || o.layerOnly).map(c => {
    const chain = [], sticky = [];
    for (let e = c.parentElement; e && e !== de && e !== document.body; e = e.parentElement) {
      if (scrollsAny(e)) chain.push(e);
      const p = getComputedStyle(e).position;
      if (p === 'sticky') sticky.push({ s: e, r: e.getBoundingClientRect(), box: scrollBoxOf(e) });
      if (p === 'fixed') break;
    }
    return { c, r: c.getBoundingClientRect(), chain, sticky, own: scrollBoxOf(c), layer: layerOf(c), inline: c.matches('a') && c.parentElement && /inline/.test(getComputedStyle(c).display) };
  });
  const spans = (sr, r) => (sr.left <= r.left + 0.5 && sr.right >= r.right - 0.5) || (sr.top <= r.top + 0.5 && sr.bottom >= r.bottom - 0.5);
  const passesUnder = (X, Y) => X.sticky.some(({ s, r, box }) => box === Y.own && !s.contains(Y.c) && spans(r, Y.r));
  const seenBeside = (X, Y) => { // X's rect cut to the scroll areas X is in and Y is not
    const v = { left: X.r.left, top: X.r.top, right: X.r.right, bottom: X.r.bottom };
    for (const e of X.chain) if (!Y.chain.includes(e)) { const p = portOf(e); v.left = Math.max(v.left, p.left); v.top = Math.max(v.top, p.top); v.right = Math.min(v.right, p.right); v.bottom = Math.min(v.bottom, p.bottom); }
    return v;
  };
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const X = boxes[i], Y = boxes[j];
    if (X.layer !== Y.layer || X.inline || Y.inline) continue;
    if (passesUnder(X, Y) || passesUnder(Y, X)) continue;
    const A = { c: X.c, r: seenBeside(X, Y) }, B = { c: Y.c, r: seenBeside(Y, X) };
    if (A.r.right - A.r.left <= 0.5 || A.r.bottom - A.r.top <= 0.5 || B.r.right - B.r.left <= 0.5 || B.r.bottom - B.r.top <= 0.5) continue; // scrolled out of sight
    const ix = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
    const iy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
    if (ix > 0.5 && iy > 0.5) add('overlap', 'fail', A.c, `${describe(B.c)}와 ${r1(ix)}×${r1(iy)}px 겹침`);
    else if (iy > 0.5 && ix > -o.gapMin && ix <= 0.5 && !(A.c.closest('[role="tablist"], [role="radiogroup"], [class*="segment"]'))) add('overlap', 'fail', A.c, `${describe(B.c)}와 가로 간격 ${r1(-ix)}px (최소 ${o.gapMin}px)`);
    else if (ix > 0.5 && iy > -o.gapMin && iy <= 0.5 && !(A.c.closest('[role="menu"], [role="listbox"], ul, ol, [role="list"]'))) add('overlap', 'warn', A.c, `${describe(B.c)}와 세로 간격 ${r1(-iy)}px`);
  }

  // ---------- 3. rows: equal-width grid, aligned lines, no single orphan ----------
  const parents = new Map();
  for (const b of buttons) { const p = b.parentElement; if (!p) continue; parents.set(p, [...(parents.get(p) || []), b]); }
  for (const [p, items] of parents) {
    const kids = items.filter(b => b.parentElement === p);
    if (kids.length < 3) continue;
    const rs = kids.map(b => ({ b, r: b.getBoundingClientRect() })).sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left);
    const lines = [];
    for (const it of rs) { const L = lines.find(l => Math.abs((l[0].r.top + l[0].r.bottom) / 2 - (it.r.top + it.r.bottom) / 2) < it.r.height / 2); L ? L.push(it) : lines.push([it]); }
    if (lines.length < 2 && p.matches('[role="menu"], [role="listbox"], ul, ol')) continue;
    for (const L of lines) {
      const cs = L.map(x => (x.r.top + x.r.bottom) / 2), spread = Math.max(...cs) - Math.min(...cs);
      if (spread > o.centerTol) add('row', 'fail', p, `같은 줄 버튼들의 세로 중심이 ${r1(spread)}px 어긋남`);
    }
    if (lines.length > 1 && lines.every(l => l.length >= 1) && lines.length < kids.length) {
      const counts_ = lines.map(l => l.length), ws = rs.map(x => x.r.width);
      if (Math.max(...ws) - Math.min(...ws) > 1) add('row', 'fail', p, `여러 줄로 나뉜 버튼 묶음의 폭이 제각각 (${r1(Math.min(...ws))}~${r1(Math.max(...ws))}px) — 같은 폭 격자로`, { lines: counts_ });
      if (counts_.at(-1) === 1) add('row', 'fail', p, `끝 줄에 버튼 하나만 남음 (${counts_.join('+')})`, { lines: counts_ });
      else if (Math.max(...counts_) - Math.min(...counts_) > 1) add('row', 'fail', p, `줄마다 버튼 수가 고르지 않음 (${counts_.join('+')})`, { lines: counts_ });
      const lefts = lines.map(l => r1(Math.min(...l.map(x => x.r.left))));
      if (Math.max(...lefts) - Math.min(...lefts) > 1) add('row', 'warn', p, '줄마다 시작선이 다름', { lefts });
    }
  }

  // ---------- 4. labels that must stay on one line ----------
  const LABEL = 'h1, h2, h3, h4, h5, h6, [role="heading"], nav a, [role="menuitem"], [role="tab"], button, [role="button"], label, legend, th, summary, dt, [role="option"], [data-qa-label]';
  for (const el of all(LABEL)) {
    if (el.closest('[data-qa-multiline]') || el.matches('label') && el.querySelector('input, select, textarea')) continue;
    const text = textOf(el); if (!text) continue;
    const n = lineCount(textRects(el)); if (n < 2) continue;
    const strict = el.matches('nav a, [role="menuitem"], [role="tab"], button, [role="button"], th, [role="option"], [data-qa-label]');
    if (strict || text.length <= o.labelMaxChars) add('label', 'fail', el, `이름이 ${n}줄로 넘어감 (${text.length}자)`, { lines: n });
  }

  // ---------- 5. line breaks inside words / before particles ----------
  const WORD = /[\p{L}\p{N}]/u;
  const urlish = tok => /^(https?:\/\/|www\.)|[\/@\\_]|\.[a-z]{2,}\b|^[\w.\-]{25,}$/i.test(tok);
  const blocks = new Set();
  {
    const tw = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const p = n.parentElement;
      if (!p || !n.nodeValue.trim() || ignored(p) || p.closest('code, pre, kbd, samp, script, style, svg, textarea, [data-qa-nobreak-check]')) continue;
      if (o.layerOnly && !p.closest(LAYER)) continue;
      let b = p; while (b.parentElement && /^inline/.test(getComputedStyle(b).display) && b !== rootEl) b = b.parentElement;
      blocks.add(b);
    }
  }
  const range = document.createRange();
  let charBudget = 300000;
  for (const b of blocks) {
    if (!visible(b) || charBudget <= 0) continue;
    if (lineCount(textRects(b)) < 2) continue;
    const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
    let prevChar = ' ', prevTop = null, prevH = 0, lineChars = 0, lineText = '', lines = 1, reported = 0;
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const pe = n.parentElement;
      if (pe.closest('code, pre, kbd, samp, svg, [aria-hidden="true"]') || !visible(pe)) { prevChar = ' '; continue; }
      const v = n.nodeValue;
      for (let i = 0; i < v.length && charBudget-- > 0; i++) {
        const ch = v[i];
        if (/\s/.test(ch)) { if (prevChar !== ' ' && lineChars) lineText += ' '; prevChar = ' '; continue; }
        range.setStart(n, i); range.setEnd(n, i + 1);
        const r = range.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (prevTop !== null && r.top > prevTop + Math.max(prevH, r.height) / 2) {
          if (WORD.test(prevChar) && WORD.test(ch) && reported < 3) {
            const tok = (v.slice(0, i).split(/\s/).pop() + v.slice(i).split(/\s/)[0]);
            const hangul = /[가-힣]/.test(prevChar + ch);
            if (!urlish(tok)) { add('break', 'fail', b, `${hangul ? '어절(조사) 중간' : '단어 중간'}에서 줄바꿈: "${prevChar}|${ch}" in "${tok.slice(0, 30)}"`); reported++; }
          }
          lineChars = 0; lineText = ''; lines++;
        }
        lineChars++; lineText += ch; prevChar = ch; prevTop = r.top; prevH = r.height;
      }
    }
    const last = lineText.trim();
    if (lineChars > 0 && !b.closest('[data-qa-multiline]')) {
      if (lineChars <= 2) add('break', 'warn', b, `끝 줄에 ${lineChars}글자만 남음 ("${last}") — text-wrap: pretty/balance 또는 문구 조정`);
      else if (lines <= 3 && !/\s/.test(last)) add('break', 'warn', b, `끝 줄에 한 단어만 남음 ("${last}") — text-wrap: balance 또는 문구 조정`);
    }
  }

  // ---------- 6. contrast (text, icons, control borders) ----------
  const seen = new Set();
  for (const b of blocks) {
    const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const el = n.parentElement;
      if (seen.has(el) || !n.nodeValue.trim() || !visible(el) || srOnly(el)) continue;
      seen.add(el);
      if (el.closest(':disabled, [aria-disabled="true"]')) continue;
      const s = getComputedStyle(el), bg = bgOf(el);
      if (!bg) { add('contrast', 'warn', el, '배경이 그림·그라데이션이라 대비 확인 불가 — 스크린샷으로 확인'); continue; }
      const fg = rgba(s.color); fg[3] *= opacityChain(el);
      const c = over(fg, bg), size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700;
      const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5, rt = ratio(c, bg);
      if (rt < need) add('contrast', 'fail', el, `글자 대비 ${r1(rt)}:1 (필요 ${need}:1)`, { ratio: r1(rt), need, color: s.color });
    }
  }
  const svgs = all('svg').filter(s => !s.parentElement.closest('svg'));
  for (const svg of svgs) {
    if (svg.closest(':disabled, [aria-disabled="true"]')) continue;
    const shape = svg.querySelector('path, line, polyline, polygon, circle, rect, ellipse') || svg;
    const s = getComputedStyle(shape);
    const paint = s.stroke && s.stroke !== 'none' && parseFloat(s.strokeWidth) > 0 ? s.stroke : s.fill;
    if (!paint || paint === 'none' || /url\(/.test(paint)) continue;
    const bg = bgOf(svg); if (!bg) continue;
    const fg = rgba(paint); fg[3] *= opacityChain(shape) * (+s.strokeOpacity || 1);
    if (fg[3] === 0) continue;
    const rt = ratio(over(fg, bg), bg);
    if (rt < 3) add('contrast', 'fail', svg.closest(CONTROL) || svg, `아이콘 대비 ${r1(rt)}:1 (필요 3:1)`, { ratio: r1(rt) });
  }
  for (const el of controls.filter(c => c.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea'))) {
    const s = getComputedStyle(el), pbg = bgOf(el.parentElement || el); if (!pbg) continue;
    const own = over(rgba(s.backgroundColor), pbg);
    const border = parseFloat(s.borderBottomWidth) > 0 ? ratio(over(rgba(s.borderBottomColor), pbg), pbg) : 1;
    const fill = ratio(own, pbg);
    if (Math.max(border, fill) < 3) add('contrast', 'warn', el, `입력 칸 경계 대비 ${r1(Math.max(border, fill))}:1 (권장 3:1)`);
  }

  // ---------- 7. overflow / offscreen / clipped ----------
  const pageOverflow = de.scrollWidth - de.clientWidth;
  if (pageOverflow > 1) add('overflow', 'fail', de, `페이지가 가로로 ${pageOverflow}px 넘침`);
  for (const el of all('*')) {
    const s = getComputedStyle(el);
    // An open dropdown or menu shows every choice whole (2026-10-22): a cut choice there fails, elsewhere it warns.
    const inMenu = el.closest('[role="listbox"],[role="menu"]');
    if (s.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) add('overflow', inMenu ? 'fail' : 'warn', el, inMenu ? '펼친 목록·메뉴의 선택지가 말줄임으로 잘림 — 목록을 넓혀 온전히 표시' : `말줄임으로 잘림${el.title ? '' : ' (title·툴팁 없음)'}`);
  }
  const hScroller = el => { for (let e = el.parentElement; e && e !== de; e = e.parentElement) { const s = getComputedStyle(e); if (/(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1) return e; } return null; };
  const leaves = all('*').filter(e => !e.closest('svg') || e.tagName.toLowerCase() === 'svg').filter(e => e.matches(CONTROL) || e.matches('svg, img, video, iframe, canvas') || [...e.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim()));
  for (const el of leaves) {
    if (o.layerOnly && !el.closest(LAYER)) continue;
    if (el.parentElement?.closest(CONTROL)) continue; // judged through its control
    const r = el.getBoundingClientRect();
    if ((r.left < -0.5 || r.right > vw + 0.5) && !hScroller(el)) add('offscreen', 'fail', el, `화면 밖으로 나감 (left ${r1(r.left)}, right ${r1(r.right)}, 화면 폭 ${vw})`);
    // clipped by an overflow:hidden/clip ancestor (scroll containers are intended)
    for (let e = el.parentElement; e && e !== de && e !== document.body; e = e.parentElement) {
      const s = getComputedStyle(e);
      const clipX = /(hidden|clip)/.test(s.overflowX), clipY = /(hidden|clip)/.test(s.overflowY);
      if (!clipX && !clipY) continue;
      if (/(auto|scroll)/.test(s.overflowX + s.overflowY)) break;
      const pr = e.getBoundingClientRect();
      const ix = Math.min(r.right, pr.right) - Math.max(r.left, pr.left), iy = Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top);
      const partial = ix > 0 && iy > 0 && ((clipX && ix < r.width - 1) || (clipY && iy < r.height - 1));
      if (partial && (el.matches(CONTROL) || el.matches('svg'))) add('clipped', 'fail', el, `${describe(e)}에 일부 잘림 (${r1(ix)}×${r1(iy)} / ${r1(r.width)}×${r1(r.height)})`);
      break;
    }
  }
  // fixed/sticky bars: their *content* must stay inside the viewport and above the home indicator
  const fixedOf = el => { for (let e = el; e && e !== de; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return e; } return null; };
  // Inside a vertical scroll area of the fixed layer (a sheet or dialog with overflow-y:auto, up to the fixed element
  // itself) content is reached by scrolling: judge the scroll area's own box instead of each part of its content.
  const vScrollerOf = el => { for (let e = el.parentElement; e && e !== de && e !== document.body; e = e.parentElement) { if (scrollsY(e)) return e; if (getComputedStyle(e).position === 'fixed') return null; } return null; };
  const fixedScrollers = new Set();
  for (const el of leaves) {
    if (el.parentElement?.closest(CONTROL)) continue;
    const f = fixedOf(el); if (!f) continue;
    const fr = f.getBoundingClientRect(); if (fr.width >= vw - 1 && fr.height >= vh - 1) continue; // full-screen overlay
    const sc = vScrollerOf(el); if (sc) { fixedScrollers.add(sc); continue; }
    const r = el.getBoundingClientRect();
    if (r.bottom > vh - safeBottom + 0.5 && r.top < vh) add('offscreen', 'fail', el, safeBottom && r.bottom <= vh + 0.5 ? `고정 막대의 내용이 하단 안전 영역(${safeBottom}px)에 가려짐 — padding-bottom: env(safe-area-inset-bottom)` : `고정 요소의 내용이 화면 아래로 ${r1(r.bottom - vh)}px 벗어남`);
    else if (r.top < -0.5 && getComputedStyle(f).position === 'fixed') add('offscreen', 'fail', el, '고정 요소의 내용이 화면 위로 벗어남');
  }
  for (const sc of fixedScrollers) {
    const r = sc.getBoundingClientRect(), s = getComputedStyle(sc);
    const end = r.bottom - parseFloat(s.borderBottomWidth) - parseFloat(s.paddingBottom); // where the last content stops at full scroll
    if (r.bottom > vh + 0.5) add('offscreen', 'fail', sc, `고정 요소 안 스크롤 상자가 화면 아래로 ${r1(r.bottom - vh)}px 벗어남 — 스크롤해도 끝이 보이지 않음`);
    else if (safeBottom && end > vh - safeBottom + 0.5 && r.top < vh) add('offscreen', 'fail', sc, `고정 요소 안 스크롤 상자의 끝이 하단 안전 영역(${safeBottom}px)에 가려짐 — padding-bottom: env(safe-area-inset-bottom)`);
    if (r.top < -0.5) add('offscreen', 'fail', sc, '고정 요소 안 스크롤 상자가 화면 위로 벗어남');
  }
  for (const el of all(LAYER).filter(e => !e.parentElement.closest(LAYER))) {
    const r = el.getBoundingClientRect();
    if (r.width >= vw - 2 * o.edgeGap) continue; // full-width sheet
    if (r.left < o.edgeGap - 0.5 || r.right > vw - o.edgeGap + 0.5) add('offscreen', 'fail', el, `펼친 층이 화면 끝에서 ${r1(Math.min(r.left, vw - r.right))}px (최소 ${o.edgeGap}px)`);
    if (r.bottom > vh + 0.5 && getComputedStyle(el).position === 'fixed') add('offscreen', 'fail', el, `펼친 층이 화면 아래로 벗어남`);
  }

  // ---------- 8. icon consistency ----------
  const EMOJI = /\p{Extended_Pictographic}|^[×✕✖✗▾▼▲▴▸►◂◀☰⋯…✓✔+−]$/u;
  const hash = svg => [...svg.querySelectorAll('path, line, polyline, polygon, circle, rect, ellipse')].map(e => e.tagName + ':' + ['d', 'points', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'rx'].map(a => e.getAttribute(a) || '').join(',')).join('|');
  const iconInfo = svg => {
    const r = svg.getBoundingClientRect(), s = getComputedStyle(svg), shape = svg.querySelector('path, line, polyline, polygon, circle, rect, ellipse');
    const ss = shape ? getComputedStyle(shape) : s;
    const filled = !!shape && ss.fill !== 'none' && !/url\(/.test(ss.fill) && rgba(ss.fill)[3] * (+ss.fillOpacity || 0) > 0;
    // The stroke as drawn: a shape scaled for optical balance carries stroke-width ÷ scale (icon-consistency.md '광학 균형').
    let sw = ss.strokeWidth;
    if (shape && shape.getScreenCTM && svg.getScreenCTM) { const a = shape.getScreenCTM(), b = svg.getScreenCTM(); if (a && b) sw = `${Math.round(parseFloat(ss.strokeWidth) * Math.hypot(a.a, a.b) / Math.hypot(b.a, b.b) * 100) / 100}px`; }
    return { svg, w: r1(r.width), h: r1(r.height), sw, vb: svg.getAttribute('viewBox') || '', filled, ctl: svg.closest(CONTROL), allow: !!svg.closest(o.iconAllow) };
  };
  const icons = svgs.map(iconInfo);
  const groups = new Map();
  const firstPerCtl = new Set();
  for (const ic of icons) {
    if (ic.allow) continue;
    if (ic.ctl) { if (firstPerCtl.has(ic.ctl)) continue; firstPerCtl.add(ic.ctl); } // one representative icon per control (skip chevrons/badges)
    const key = (ic.ctl || ic.svg).parentElement; groups.set(key, [...(groups.get(key) || []), ic]);
  }
  for (const [g, list] of groups) {
    if (list.length < 2) continue;
    const ws = list.map(i => i.w), sws = new Set(list.filter(i => !i.filled).map(i => i.sw)), vbs = new Set(list.map(i => i.vb));
    if (Math.max(...ws) - Math.min(...ws) > 0.5) add('icon', 'fail', g, `같은 묶음 아이콘 크기가 다름 (${[...new Set(ws)].join(', ')}px)`);
    if (sws.size > 1) add('icon', 'fail', g, `같은 묶음 아이콘 선 굵기가 다름 (${[...sws].join(', ')})`);
    if (vbs.size > 1) add('icon', 'warn', g, `같은 묶음 아이콘 viewBox가 다름 (${[...vbs].join(' / ')})`);
    const unstated = list.filter(i => i.filled && !(i.ctl && i.ctl.matches('[aria-pressed="true"], [aria-selected="true"], [aria-current]:not([aria-current="false"]), [aria-checked="true"]')));
    if (unstated.length && unstated.length < list.length) add('icon', 'fail', g, `선형·채움 아이콘이 섞임 (상태 표시가 아닌 채움 ${unstated.length}개)`);
  }
  if (o.iconClass) { for (const ic of icons) if (!ic.allow && !(ic.svg.getAttribute('class') || '').split(/\s+/).includes(o.iconClass)) add('icon', 'warn', ic.svg.closest(CONTROL) || ic.svg, `'${o.iconClass}' 세트가 아닌 아이콘 — 같은 세트인지 확인 (예외면 data-icon-allow)`); }
  else { // the page's dominant outline style is "the set"; deviations are suspects
    const outline = icons.filter(i => !i.allow && !i.filled);
    const top = key => { const m = new Map(); for (const i of outline) m.set(i[key], (m.get(i[key]) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1])[0]?.[0]; };
    const sw = top('sw'), vb = top('vb');
    if (outline.length >= 4) for (const i of outline) if (i.sw !== sw || i.vb !== vb) add('icon', 'warn', i.ctl || i.svg, `대표 아이콘 세트(선 ${sw}, viewBox ${vb})와 다름 (선 ${i.sw}, viewBox ${i.vb || '없음'}) — 같은 세트인지 확인`);
  }
  for (const b of buttons) { const t = textOf(b); if (t && (EMOJI.test(t) || [...t].length <= 2 && /\p{Extended_Pictographic}/u.test(t))) add('icon', 'fail', b, `글자 기호·이모지를 아이콘으로 씀 ("${t}") — Lucide SVG로`); }
  const byName = new Map(), byShape = new Map();
  for (const ic of icons) {
    if (!ic.ctl || textOf(ic.ctl) || ic.allow) continue;
    const name = accName(ic.ctl).replace(/\s+/g, ' ').trim(), h = hash(ic.svg); if (!name || !h) continue;
    byName.set(name, new Map([...(byName.get(name) || new Map()), [h, ic.ctl]]));
    byShape.set(h, new Map([...(byShape.get(h) || new Map()), [name, ic.ctl]]));
  }
  for (const [name, m] of byName) if (m.size > 1) add('icon', 'fail', [...m.values()][1], `같은 이름 "${name}"에 서로 다른 아이콘 ${m.size}종`);
  for (const [, m] of byShape) if (m.size > 1) add('icon', 'warn', [...m.values()][1], `같은 아이콘이 다른 이름으로 쓰임: ${[...m.keys()].map(n => `"${n}"`).join(', ')}`);

  // ---------- 9. scrolling ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce && getComputedStyle(de).scrollBehavior === 'smooth') add('scroll', 'fail', de, '줄임 동작 설정인데 scroll-behavior: smooth');
  const scrollers = all('*').filter(e => { const s = getComputedStyle(e); return (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1) || (/(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1); });
  const pageScrolls = de.scrollHeight > de.clientHeight + 1;
  if (pageScrolls && getComputedStyle(de).scrollbarColor === 'auto' && getComputedStyle(document.body).scrollbarColor === 'auto') add('scroll', 'warn', de, '페이지 스크롤바가 기본 모양 (scrollbar-color 미지정)');
  for (const e of scrollers) {
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    const horiz = /(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1 && !(/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1);
    if (s.scrollbarWidth === 'none') { if (horiz && s.maskImage === 'none' && s.webkitMaskImage === 'none') add('scroll', 'warn', e, '스크롤바를 숨겼는데 끝 흐림(더 있음 표시)이 없음'); }
    else {
      if (s.scrollbarWidth === 'auto' && s.scrollbarColor === 'auto') add('scroll', 'warn', e, '기본 스크롤바 (scrollbar-width: thin + 테마 색 권장)');
      else if (s.scrollbarColor === 'auto') add('scroll', 'warn', e, 'scrollbar-color 미지정 (테마 토큰 색 권장)');
    }
    if (!horiz && /^auto/.test(s.overscrollBehaviorY || s.overscrollBehavior)) add('scroll', 'warn', e, 'overscroll-behavior: contain 없음 (끝에서 바깥 페이지가 같이 스크롤)');
    if (!horiz && pageScrolls && r.height > vh * 0.6 && getComputedStyle(e).position !== 'fixed' && !e.closest(LAYER)) add('scroll', 'fail', e, `이중 스크롤: 페이지와 안쪽 상자(높이 ${Math.round(r.height)}px)가 함께 세로 스크롤`);
  }

  // ---------- 10. accessibility basics ----------
  if (!de.getAttribute('lang')) add('a11y', 'fail', de, '<html lang> 없음 (3.1.1)');
  for (const c of controls) {
    if (c.matches('input[type="hidden"]')) continue;
    if (!accName(c) && !(c.matches('input, select, textarea') && (c.labels?.length || c.placeholder))) add('a11y', 'fail', c, '접근성 이름 없음 (4.1.2)');
    const r = c.getBoundingClientRect();
    const inlineLink = c.matches('a') && c.parentElement && [...c.parentElement.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    if (inlineLink || c.matches('input[type="checkbox"], input[type="radio"]') && c.closest('label')) continue;
    const m = Math.min(r.width, r.height);
    if (m < o.target - 0.01) add('a11y', 'fail', c, `조작 영역 ${r1(r.width)}×${r1(r.height)}px (최소 ${o.target}px, 2.5.8)`);
    else if (m < o.targetProject - 0.01) add('a11y', 'warn', c, `조작 영역 ${r1(r.width)}×${r1(r.height)}px (프로젝트 기준 ${o.targetProject}px)`);
  }
  for (const el of all('div, span, li, img, svg, p, td, section, article')) {
    if (el.closest(CONTROL) || el.closest('label') || el.tabIndex >= 0 || el.matches(CONTROL)) continue;
    if (getComputedStyle(el).cursor === 'pointer' && (!el.parentElement || getComputedStyle(el.parentElement).cursor !== 'pointer')) add('a11y', 'fail', el, '클릭 모양인데 키보드로 갈 수 없는 요소 (button 사용, 2.1.1)');
  }
  for (const el of all('[data-gesture]')) {
    const altSel = el.getAttribute('data-gesture-alt');
    let alt = null; try { alt = altSel ? document.querySelector(altSel) : null; } catch {}
    if (!(alt && visible(alt)) && !el.hasAttribute('aria-keyshortcuts')) add('a11y', 'fail', el, `숨긴 조작(${el.getAttribute('data-gesture')})에 보이는 대체 경로 없음 — data-gesture-alt로 연결 (2.5.1, 2.1.1)`);
  }
  for (const m of all('video, audio')) if (!m.querySelector('track[kind="captions"], track[kind="subtitles"]')) add('a11y', 'warn', m, '자막 track 없음 (1.2.2)');
  for (const f of all('iframe[src*="youtube"], iframe[src*="vimeo"]')) add('a11y', 'warn', f, '외부 영상 플레이어 — 자막 제공을 수동 확인 (1.2.2)');
  if (!document.querySelector('[aria-live], [role="status"], [role="alert"], output')) add('a11y', 'warn', document.body, '상태 알림 영역(aria-live/role=status) 없음 — 저장·복사 결과 알림 확인 (4.1.3)');
  for (const img of all('img')) if (!img.hasAttribute('alt')) add('a11y', 'fail', img, 'img에 alt 없음 (1.1.1)');
  for (const svg of svgs.filter(s => s.getAttribute('role') === 'img')) if (!accName(svg)) add('a11y', 'fail', svg, 'role=img SVG에 이름 없음 (1.1.1)');
  { let last = 0; for (const h of all('h1, h2, h3, h4, h5, h6')) { const lv = +h.tagName[1]; if (last && lv > last + 1) add('a11y', 'warn', h, `제목 단계 건너뜀 h${last}→h${lv} (1.3.1)`); last = lv; } }

  const summary = { fail: 0, warn: 0 };
  for (const c of Object.values(counts)) { summary.fail += c.fail; summary.warn += c.warn; }
  return {
    meta: { url: location.href, width: vw, height: vh, dpr: devicePixelRatio, dark: matchMedia('(prefers-color-scheme: dark)').matches, theme: de.getAttribute('data-theme') || de.className || '', reducedMotion: reduce },
    summary, counts, findings,
  };
};
