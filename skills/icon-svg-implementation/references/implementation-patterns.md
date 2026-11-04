# Implementation Patterns

## React Icons

Use existing project conventions first. In Tailwind projects, size and color through classes:

```tsx
import { LuSettings } from "react-icons/lu";

<LuSettings aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
```

For non-Tailwind projects, prefer CSS classes over inline styles:

```tsx
<LuSettings aria-hidden="true" className="settingsIcon" />
```

Do not use viewport-based font sizes for icons. Keep fixed component-level sizes such as `16`, `18`, `20`, `24`, `1em`, `h-4 w-4`, or established design tokens.

## Icon-Only Buttons

Icon-only buttons need:

- `type="button"` unless they intentionally submit a form.
- `aria-label` with the action name.
- A tooltip or `title` for unfamiliar actions.
- A stable width and height so hover/focus states do not shift layout.
- Visible focus styling that matches the project.

Example:

```tsx
<button type="button" aria-label="Copy link" title="Copy link" className="iconButton">
  <LuCopy aria-hidden="true" className="h-4 w-4" />
</button>
```

## Inline SVG Cleanup

When pasting or converting raw SVG:

- Keep `viewBox`.
- Remove hardcoded `width` and `height` only if the surrounding component controls size.
- Keep brand `fill` colors for logos unless explicitly making the logo monochrome.
- For generic line icons, use `stroke="currentColor"` and `fill="none"` when the SVG shape supports it.
- Convert kebab-case SVG attributes to JSX names in TSX: `clip-rule` to `clipRule`, `fill-rule` to `fillRule`, `stroke-linecap` to `strokeLinecap`.
- Prefix internal IDs if multiple copies may render on one page, especially `clipPath`, `mask`, `filter`, and gradient IDs.
- Remove editor metadata, comments, scripts, event handlers, and external references.
- Do not strip `<title>` from meaningful logos; add one if missing.

## Brand Logos

For brand marks:

- Preserve official proportions and colors.
- Do not recolor multi-color brand logos to match a theme unless the brand permits it or the user explicitly asks.
- Prefer the light or dark variant that contrasts with the current background.
- If both icon and wordmark exist, use the wordmark for brand identity areas and the icon mark for compact navigation or badges.
- If the logo appears next to visible brand text, make the SVG decorative with `aria-hidden="true"`.

## Visual Verification

Before finishing UI work involving icons:

- Check icons align with text baseline and nearby controls.
- Check hover, active, disabled, and focus states.
- Check mobile and desktop sizes.
- Check dark mode if the project supports it.
- Check that loading, empty, and error states do not cause icon layout shifts.
