# Change Safety

Use this axis to prevent visual work from widening the technical blast radius.
Good UI code is easy to understand, change, test, and roll back.

## Preserve Contracts

- Keep the installed framework and current component conventions.
- Preserve API calls, URLs, analytics hooks, form field names and order, legal
  copy, data meaning, and established brand assets unless explicitly approved.
- Treat query parameters, deep links, back/forward behavior, saved views, and
  locale-aware formatting as user contracts when they carry task context.
- Read the component, caller, tests, and nearby patterns before editing.
- Keep narrow visual changes local. Do not refactor unrelated code.

## Code Structure Checks

| Axis | Ask |
| --- | --- |
| Readability | Can the intent be followed top to bottom without mixing unrelated branches? |
| Predictability | Do names, parameters, return shapes, and side effects match expectations? |
| Cohesion | Are tokens, states, and components that change together close together? |
| Coupling | How many unrelated files or flows can this visual change break? |

Abstraction is the last resort. Allow small local duplication when a shared
helper would force unrelated surfaces to move together.

## Dependency Gate

Do not introduce React into Vanilla or replace Vue for visual convenience.
Do not add UI frameworks, animation packages, 3D, canvas, or WebGL without
approval that names bundle, performance, accessibility, and maintenance costs.

## Verification

Run focused tests, typecheck, lint, or build according to the repository. Inspect
desktop and mobile together. Verify primary interaction, keyboard focus, console
errors, refresh/back behavior, long real content, locale formats, and state
transitions. Fix observed P0 and P1 issues, confirm once, then stop polishing.

If no browser is available, report `코드 기준 확인` and list the missing visual
evidence. Never translate absence of errors into visual proof.
