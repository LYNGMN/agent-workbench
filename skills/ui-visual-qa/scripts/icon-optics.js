// icon-optics.js — measure how big and where icons LOOK, not their boxes.
// Paste into a page (or inject) and call iconOptics({ selector: '.toolbar button', ref: 0 }).
// Each matched element's first <svg> is redrawn on a canvas from its own geometry: the path data, the transform each
// shape really has on screen (CSS transform included, via getScreenCTM), the computed stroke width, caps and joins.
// Returns one row per icon. Sizes and areas are in SCREEN px (px²), so icons whose viewBox differs (Lucide 24, a brand mark
// 26.667, Slack 60) compare fairly; only dx/dy stay in viewBox units:
//   inkW/inkH   the drawn ink's bounding box, px; hull the area of the ink's convex outline (what the eye fills in), px²
//   ink         ink area (anti-aliased coverage), px²
//   dx/dy       ink centroid − viewBox centre, viewBox units (+ = right/down)
//   oxPx/oyPx   optical centre − viewBox centre, on screen: the midpoint of the ink box centre and the ink centroid
//               (a T reads by its bar but is placed by its outline, so neither alone)
//   size        visible size against the reference icon: √(hull ratio) (1 = same). Ink amount is left out on purpose:
//               in side-by-side checks (10-08) a palette full of dots looked as big as a bare outline of the same hull.
// Guideline: icons in one group within ±5% size and |oxPx|,|oyPx| ≤ 0.5. Diagonal-only glyphs (x, ↗) read larger than
// their hull: aim them at 0.93.
function iconOptics({ selector, ref = 0, scale = 10 } = {}) {
  const shapes = 'path,circle,ellipse,line,rect,polyline,polygon';
  const toPath = el => {
    const n = el.tagName.toLowerCase(), a = name => +el.getAttribute(name) || 0;
    if (n === 'path') return el.getAttribute('d') || '';
    if (n === 'circle') { const cx = a('cx'), cy = a('cy'), r = a('r'); return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`; }
    if (n === 'ellipse') { const cx = a('cx'), cy = a('cy'), rx = a('rx'), ry = a('ry'); return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`; }
    if (n === 'line') return `M${a('x1')} ${a('y1')}L${a('x2')} ${a('y2')}`;
    if (n === 'rect') { const x = a('x'), y = a('y'), w = a('width'), h = a('height'), r = Math.min(a('rx') || a('ry'), w / 2, h / 2); return r ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z` : `M${x} ${y}h${w}v${h}h${-w}Z`; }
    const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
    let d = ''; for (let i = 0; i < pts.length; i += 2) d += (i ? 'L' : 'M') + pts[i] + ' ' + pts[i + 1];
    return n === 'polygon' ? d + 'Z' : d;
  };
  const rows = [...document.querySelectorAll(selector)].map(host => {
    const svg = host.matches('svg') ? host : host.querySelector('svg');
    if (!svg) return null;
    const vb = svg.viewBox.baseVal, vw = vb?.width || svg.getBBox().width, vh = vb?.height || vw;
    const S = Math.round(vw * scale), canvas = document.createElement('canvas');
    canvas.width = canvas.height = S;
    const ctx = canvas.getContext('2d'), base = svg.getScreenCTM().inverse();
    for (const el of svg.querySelectorAll(shapes)) {
      const style = getComputedStyle(el), m = base.multiply(el.getScreenCTM());
      ctx.setTransform(scale * m.a, scale * m.b, scale * m.c, scale * m.d, scale * (m.e - (vb?.x || 0)), scale * (m.f - (vb?.y || 0)));
      const p = new Path2D(toPath(el));
      if (style.fill !== 'none' && style.fillOpacity !== '0') { ctx.fillStyle = '#000'; ctx.fill(p); }
      if (style.stroke !== 'none') {
        ctx.lineWidth = parseFloat(style.strokeWidth) || 1; ctx.lineCap = style.strokeLinecap; ctx.lineJoin = style.strokeLinejoin;
        ctx.strokeStyle = '#000'; ctx.stroke(p);
      }
    }
    const data = ctx.getImageData(0, 0, S, S).data;
    let n = 0, sx = 0, sy = 0, x0 = S, y0 = S, x1 = -1, y1 = -1;
    const edge = [];
    for (let y = 0; y < S; y++) {
      let first = -1, last = -1;
      for (let x = 0; x < S; x++) {
        const v = data[(y * S + x) * 4 + 3] / 255;
        if (v < .05) continue;
        n += v; sx += (x + .5) * v; sy += (y + .5) * v;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (v >= .5) { if (first < 0) first = x; last = x; }
      }
      if (first >= 0) edge.push([first, y], [first, y + 1], [last + 1, y], [last + 1, y + 1]);
    }
    // Convex hull (monotone chain) of the solid ink's row ends, then its area.
    edge.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = list => { const out = []; for (const p of list) { while (out.length > 1 && cross(out.at(-2), out.at(-1), p) <= 0) out.pop(); out.push(p); } out.pop(); return out; };
    const hullPts = edge.length > 2 ? [...half(edge), ...half([...edge].reverse())] : [];
    let hull = 0;
    for (let i = 0; i < hullPts.length; i++) { const [ax, ay] = hullPts[i], [bx, by] = hullPts[(i + 1) % hullPts.length]; hull += ax * by - bx * ay; }
    // px = screen px per viewBox unit (viewBox, width/height and any CSS transform included)
    const ctm = svg.getScreenCTM(), px = Math.hypot(ctm.a, ctm.b), f = 1 / scale;
    const dx = n ? sx / n * f - vw / 2 : 0, dy = n ? sy / n * f - vh / 2 : 0;
    const bx = (x0 + x1 + 1) / 2 * f - vw / 2, by = (y0 + y1 + 1) / 2 * f - vh / 2;
    return {
      name: host.getAttribute('data-icon') || host.getAttribute('aria-label') || host.textContent.trim().slice(0, 20),
      inkW: (x1 - x0 + 1) * f * px, inkH: (y1 - y0 + 1) * f * px, hull: Math.abs(hull) / 2 * f * f * px * px, ink: n * f * f * px * px, dx, dy,
      oxPx: (bx + dx) / 2 * px, oyPx: (by + dy) / 2 * px,
    };
  }).filter(Boolean);
  const r = typeof ref === 'number' ? rows[ref] : rows.find(row => row.name === ref);
  for (const row of rows) {
    row.size = r ? Math.sqrt(row.hull / r.hull) : 1;
    for (const k of Object.keys(row)) if (typeof row[k] === 'number') row[k] = Math.round(row[k] * 100) / 100;
  }
  return rows;
}
if (typeof window !== 'undefined') window.iconOptics = iconOptics;
