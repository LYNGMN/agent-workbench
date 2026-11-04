// dropdown-check.js — measure native <select> and custom dropdown/menu/listbox quality from inside the page.
// Paste into the page (console, Playwright page.evaluate, Puppeteer) and call dropdownCheck().
// Open the custom popup first (click its trigger) to measure the open list; closed popups are skipped.
// Returns { summary:{fail,warn}, findings:[{check, level, el, msg, data}] }. Numbers are CSS px.
// Checks: arrow (native select arrow size/position/room), cut (closed value or choice ends in "…" / is clipped),
//         input (phone font < 16px, tap height < 44px), edge (open list leaves the screen or is < 8px from its edge),
//         start (open list text start vs the current value's text start), scroll (list scrollbar eats the text column).
function dropdownCheck({ viewportPad = 8, minTap = 44, root = document } = {}) {
  const findings = [];
  const r1 = n => Math.round(n * 100) / 100;
  const desc = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const add = (check, level, el, msg, data) => findings.push({ check, level, el: desc(el), msg, data });
  const visible = el => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  const ctx = document.createElement('canvas').getContext('2d');
  const textWidth = (text, s) => { ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`; return ctx.measureText(text).width + (parseFloat(s.letterSpacing) || 0) * text.length; };

  // --- native <select> -------------------------------------------------------------------------------
  for (const sel of [...root.querySelectorAll('select')].filter(visible)) {
    const s = getComputedStyle(sel), b = sel.getBoundingClientRect();
    const padR = parseFloat(s.paddingRight), padL = parseFloat(s.paddingLeft), size = parseFloat(s.fontSize);
    const styled = s.appearance === 'none' || s.webkitAppearance === 'none';
    if (styled) {
      // custom arrow lives in background-image; read its size and offset
      const hasArrow = s.backgroundImage !== 'none';
      if (!hasArrow) add('arrow', 'warn', sel, 'appearance:none but no background arrow — is the arrow drawn by a sibling element?', {});
      else {
        const bs = s.backgroundSize.split(' ').map(parseFloat);
        const arrowW = bs[0], arrowH = bs[1] ?? bs[0];
        if (!Number.isNaN(arrowW) && (arrowW < 14 || arrowW > 20)) add('arrow', 'warn', sel, `arrow is ${arrowW}px (aim for 16px)`, { arrow: arrowW });
        // computed values look like "calc(100% - 14px)" / "50%"
        const px = s.backgroundPositionX, py = s.backgroundPositionY;
        const m = /calc\(100% - ([\d.]+)px\)/.exec(px);
        const right = m ? parseFloat(m[1]) : (px === '100%' ? 0 : NaN);
        if (!Number.isNaN(right) && right < 10) add('arrow', 'fail', sel, `arrow sits ${right}px from the right edge (aim for 14px; never touch the border)`, { right });
        if (py !== '50%') add('arrow', 'warn', sel, `arrow is not vertically centred (${py})`, { pos: py });
        const need = (Number.isNaN(right) ? 14 : right) + arrowW + 14;
        if (padR + 0.5 < Math.max(44, need - 14)) add('arrow', 'fail', sel, `padding-right ${r1(padR)}px leaves < 44px between text and arrow`, { padR: r1(padR) });
      }
    } else if (padR < 4) add('arrow', 'warn', sel, 'native arrow in use: cannot control its size/offset — check by screenshot', {});
    // closed value must never be cut: measure every option against the text column
    const column = b.width - padL - padR - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
    const widest = [...sel.options].map(o => ({ o, w: textWidth(o.textContent.trim(), s) })).sort((a, c) => c.w - a.w)[0];
    if (widest && widest.w > column + 0.5) add('cut', 'fail', sel, `longest choice "${widest.o.textContent.trim().slice(0, 24)}" is ${r1(widest.w)}px but the text column is ${r1(column)}px`, { need: r1(widest.w), have: r1(column) });
    if (b.height < minTap - 0.5) add('input', 'fail', sel, `height ${r1(b.height)}px < ${minTap}px tap area`, { h: r1(b.height) });
    if (vw <= 600 && size < 16) add('input', 'fail', sel, `font ${size}px < 16px — iOS zooms the page on focus`, { fontSize: size });
  }

  // --- custom dropdown / menu / listbox (open ones) ----------------------------------------------------
  const panels = [...root.querySelectorAll('[role=listbox],[role=menu],[data-dropdown-panel],ul[class*=dropdown],ul[class*=menu],div[class*=dropdown-menu],div[class*=popover]')]
    .filter(el => visible(el) && el.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio],li,button').length > 1);
  for (const panel of panels) {
    const pb = panel.getBoundingClientRect(), ps = getComputedStyle(panel);
    if (pb.left < viewportPad - 0.5 || pb.right > vw - viewportPad + 0.5 || pb.top < viewportPad - 0.5 || pb.bottom > vh - viewportPad + 0.5)
      add('edge', 'fail', panel, `open list is outside the ${viewportPad}px safe margin (left ${r1(pb.left)}, right ${r1(vw - pb.right)}, top ${r1(pb.top)}, bottom ${r1(vh - pb.bottom)})`, { left: r1(pb.left), right: r1(vw - pb.right), top: r1(pb.top), bottom: r1(vh - pb.bottom) });
    const items = [...panel.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio],li,button')].filter(visible);
    let cutCount = 0, shortCount = 0;
    for (const it of items) {
      const s = getComputedStyle(it), clipped = it.scrollWidth > it.clientWidth + 1 || (s.textOverflow === 'ellipsis' && it.scrollWidth > it.clientWidth);
      const text = it.querySelector('span,div') ?? it, ts = getComputedStyle(text);
      if (clipped || (ts.textOverflow === 'ellipsis' && text.scrollWidth > text.clientWidth + 1)) cutCount++;
      if (it.getBoundingClientRect().height < minTap - 0.5) shortCount++;
    }
    if (cutCount) add('cut', 'fail', panel, `${cutCount} choice(s) are clipped or end in "…" — widen the list to the right instead`, { count: cutCount });
    if (shortCount) add('input', 'warn', panel, `${shortCount} choice(s) are shorter than ${minTap}px`, { count: shortCount });
    // scrollbar in the list should not shrink the text column: raise max-height first
    if (panel.scrollHeight > panel.clientHeight + 1 && /auto|scroll/.test(ps.overflowY)) {
      const sbw = panel.offsetWidth - panel.clientWidth;
      add('scroll', sbw > 0 ? 'warn' : 'warn', panel, `list scrolls (${panel.scrollHeight}px in ${panel.clientHeight}px, scrollbar ${sbw}px) — raise max-height before narrowing text`, { scrollbar: sbw });
    }
    // list text should start where the current value's text starts (widen right, not toward the icon)
    const trigger = root.querySelector(`[aria-controls="${panel.id}"], [aria-expanded=true]`);
    if (trigger && items.length) {
      const tr = document.createRange(); tr.selectNodeContents(trigger.querySelector('span,div') ?? trigger);
      const first = items.find(i => i.getAttribute('aria-selected') === 'true' || i.getAttribute('aria-checked') === 'true') ?? items[0];
      const fr = document.createRange(); fr.selectNodeContents(first.querySelector('span,div') ?? first);
      const tStart = tr.getBoundingClientRect().left, fStart = fr.getBoundingClientRect().left;
      if (Math.abs(tStart - fStart) > 1.5 && pb.right < vw - viewportPad - 1) add('start', 'warn', panel, `list text starts ${r1(fStart - tStart)}px from the current value's text (aim for 0 unless the list had to shift at the screen edge)`, { delta: r1(fStart - tStart) });
    }
  }

  // closed custom triggers whose label is cut
  for (const t of [...root.querySelectorAll('[aria-haspopup=listbox],[aria-haspopup=menu],[aria-haspopup=true]')].filter(visible)) {
    const label = t.querySelector('span,div') ?? t, ls = getComputedStyle(label);
    if (label.scrollWidth > label.clientWidth + 1 && ls.textOverflow === 'ellipsis' && !t.hasAttribute('data-qa-free-text')) add('cut', 'fail', t, 'trigger label is cut with "…" (item names must stay whole; only free text such as channel names may use …)', {});
    const tb = t.getBoundingClientRect();
    if (tb.height < minTap - 0.5) add('input', 'fail', t, `trigger height ${r1(tb.height)}px < ${minTap}px`, { h: r1(tb.height) });
  }

  return { summary: { fail: findings.filter(f => f.level === 'fail').length, warn: findings.filter(f => f.level === 'warn').length, selects: root.querySelectorAll('select').length, panels: panels.length }, findings };
}
if (typeof window !== 'undefined') window.dropdownCheck = dropdownCheck;
