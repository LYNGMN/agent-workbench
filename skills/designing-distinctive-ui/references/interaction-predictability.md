# Interaction Predictability

Use this axis when controls, forms, navigation, overlays, or asynchronous states
are involved. A control should behave as its name, appearance, and platform role
imply.

## Required States

- Form: default, focus, filled, invalid, disabled, submitting, success.
- Data UI: loading, sparse, dense, empty, error, stale.
- Navigation and overlays: hover, focus, active, open, escape or close, focus return.
- Responsive interaction: touch, keyboard, zoom, reduced motion, long text.
- Stateful views: refresh, back/forward, deep link, shared URL, permission loss.

## Checks

| Signal | Correction |
| --- | --- |
| Focus outline is removed | Replace it with a visible brand-compatible focus indicator |
| Error is color only | Add connected text that explains the problem and next action |
| A small control is visually elegant but hard to tap | Preserve a comfortable target while reducing visual weight inside it |
| A link performs an action or a button navigates | Use native semantics matching the behavior |
| Loading hides the action label or changes control width | Keep the action recognizable, expose progress, and disable only what must wait |
| Dialog closes but focus disappears | Restore focus to the control that opened it |
| Filters or tabs lose meaningful context on refresh | Put shareable or refresh-relevant state in the URL |
| A persistent failure appears only in a toast | Keep recovery beside the failed region; use the toast as secondary feedback |

Prefer native HTML before ARIA. Keep labels, helper text, and errors
programmatically related. Use standard keyboard conventions inside tabs, menus,
listboxes, and grids. Keep focus visible, persistent, and distinct from
selection. Respect `prefers-reduced-motion`.

## Severity

- P0: a core flow cannot be completed or data can be lost.
- P1: keyboard, screen-reader, mobile, error recovery, or primary feedback is broken.
- P2: behavior is inconsistent or misleading but recoverable.
- P3: optional delight or clarity improvement.

Automated checks support an accessibility review; they do not prove conformance.
