---
name: icon-svg-implementation
description: Choose, fetch, and implement polished icons and SVG logos for React, Next.js, and generic frontend UI work. Use when a task mentions icons, icon buttons, SVG assets, logos, brand marks, React Icons, SVGL, lucide/react-icons packages, replacing emoji/text with icons, improving visual polish, auditing icon sizing, color, accessibility, and implementation quality, or Korean requests such as 아이콘, SVG, 로고, 버튼 아이콘, 아이콘 사이트, 보기 좋게.
argument-hint: "[아이콘이나 로고를 넣을 곳]"
---

# Icon SVG Implementation

## Workflow

Start by inspecting the project, not by adding a package.

1. Identify the frontend stack, package manager, existing icon dependencies, component conventions, styling system, and nearby icon usage.
2. Choose the source:
   - Use existing local icon components or installed libraries when they fit.
   - Use React Icons for generic UI/action icons in React or Next.js.
   - Use SVGL or official brand assets for product logos and brand marks.
   - Use inline SVG only when a library import is unavailable, a logo must be exact, or the project already stores local SVG components/assets.
3. Implement the icon with the repo's existing pattern for imports, sizing, color, class names, accessibility, and tooltips.
4. Verify the rendered result at relevant viewport sizes. For web UI, use gstack `/browse` when live visual inspection is useful.

Do not introduce a new dependency unless the repository has no suitable icon path and the user-facing benefit is clear. If adding one is necessary, prefer the smallest dependency that matches the existing stack and explain why.

## Source Guidance

Read `references/sources.md` when choosing between React Icons, SVGL, and raw SVG sources.

For Korean-facing guidance, read `references/ko.md`. Use it when the user writes in Korean or asks for non-developer-friendly explanations.

Use React Icons for common actions such as search, menu, settings, upload, download, copy, calendar, user, chart, and arrows. Prefer a single icon family per surface unless the existing UI already mixes families intentionally.

Use SVGL for recognizable product marks such as OpenAI, Google, Stripe, GitHub, Vercel, Discord, or framework logos. Preserve brand colors unless the surrounding design explicitly needs a monochrome treatment.

## Implementation Guidance

Read `references/implementation-patterns.md` before editing icon code in a real project.

Keep icon dimensions stable:

```tsx
import { LuSearch } from "react-icons/lu";

export function SearchIcon() {
  return <LuSearch aria-hidden="true" className="h-4 w-4 shrink-0" />;
}
```

For icon-only buttons, provide an accessible name and a tooltip if the action is not immediately obvious:

```tsx
<button type="button" aria-label="Search" title="Search">
  <LuSearch aria-hidden="true" className="h-4 w-4" />
</button>
```

For informative SVG logos, keep or add a title. For decorative logos or repeated marks next to visible text, use `aria-hidden="true"` to avoid duplicate announcements.

## SVGL Helper

Use `scripts/fetch-svgl.py` (run from this skill's folder) when an SVGL asset should be searched or downloaded deterministically.

```bash
python3 scripts/fetch-svgl.py search codex
python3 scripts/fetch-svgl.py fetch codex --variant light --out /private/tmp/codex.svg
```

The script uses only Python standard library modules. It handles SVGL routes that are a string or a `{"light": "...", "dark": "..."}` object.
