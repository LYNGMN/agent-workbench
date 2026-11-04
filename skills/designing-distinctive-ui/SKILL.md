---
name: designing-distinctive-ui
description: Use when materially redesigning an existing Vanilla or Vue product UI to remove generic AI-template styling or translate visual references into a product-specific direction while preserving behavior and stack.
argument-hint: "[다시 꾸밀 화면이나 참고 이미지]"
---

# Designing Distinctive UI

## Overview

Own one outcome: product-specific visual direction implemented safely in an
existing Vanilla or Vue interface. Impeccable is the declared visual engine,
not a second owner.

## Ownership Gate

Activate only when visual direction or anti-template redesign is the request's
primary outcome. Explicitly naming this skill also qualifies. Confirm ownership
before loading the engine, then announce:

`스킬 라우팅: designing-distinctive-ui → impeccable`

Generic requests such as “premium”, “high-quality”, “예쁘게”, or “frontend를
개선해줘” are recommendation signals, not automatic triggers. If product,
existing UI, or preservation boundaries are unavailable, recommend this skill
without claiming it is active.

## Defer When

One domain skill owns a phase. Do not co-run overlapping design workflows.

| Primary outcome | Owner |
| --- | --- |
| Design system, brand rules, `DESIGN.md` | `design-consultation` |
| Multiple concepts or comparison | `design-shotgun` |
| Approved mockup to standalone HTML | `design-html` |
| Live visual QA, screenshots, audit, polish | `design-review` |
| Accessibility, forms, focus, authentication | `wcag22-vibe-coding` |
| React or TypeScript structure | `frontend-fundamentals` |
| Icons, SVG, logo, brand mark | `icon-svg-implementation` |
| Lighthouse, LCP, page speed | `web-perf` |
| Reference browsing without implementation | `browse` |
| Explicit direct Impeccable request | `impeccable` |

For a mixed request, own only visual implementation and hand accessibility,
performance, or browser verification to its specialist in a later phase.

## Start

Inspect instructions, version control, target UI, callers, tokens, real content,
and installed packages. State purpose, visible change, preserved behavior,
risks, and deployment status.

Load `impeccable`, run context once, and choose one playbook. If unavailable,
stop build edits and provide its official install command. Never replace real
behavior with mocks or change framework or dependencies without approval.

## Route

For material redesign, read [design direction](references/design-direction.md)
and [reference research](references/reference-research.md). For real product
data and states, read [content and state integrity](references/content-and-state-integrity.md).

Load only affected quality axes:

- [Visual readability](references/visual-readability.md)
- [Interaction predictability](references/interaction-predictability.md)
- [System cohesion](references/system-cohesion.md)
- [Change safety](references/change-safety.md)

Use [platform adapters](references/platform-adapters.md) for runtime differences.
Finish with [non-developer handoff](references/nondeveloper-handoff.md). Never
claim visual, responsive, or accessibility verification from code alone.
