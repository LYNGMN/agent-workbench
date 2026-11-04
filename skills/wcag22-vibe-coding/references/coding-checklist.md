# WCAG 2.2 AA Vibe Coding Checklist

Use this before writing or reviewing user-facing web UI. Default target: WCAG 2.2 AA.

## Fast Triage

For each screen or component, ask:

- Can a keyboard-only user operate it from start to finish?
- Can a screen reader user understand names, roles, values, errors, and status changes?
- Is meaning available without relying on color, shape, position, sound, or motion alone?
- Does the page work at mobile width and with zoom or larger text?
- Are forms, auth, checkout, and destructive actions forgiving and understandable?
- Are custom controls justified, or can native HTML controls do the job?

## Core Numeric Checks

| Area | WCAG AA requirement |
|---|---|
| Normal text contrast | At least `4.5:1` |
| Large text contrast | At least `3:1` |
| UI components and meaningful graphics | At least `3:1` against adjacent colors |
| Reflow | No loss at `320 CSS px` width, except true two-dimensional content |
| Text spacing override | No loss when line height is `1.5`, paragraph spacing `2`, letter spacing `0.12`, word spacing `0.16` times font size |
| Pointer target size | At least `24 by 24 CSS px`, unless spacing/equivalent/inline/user-agent/essential exceptions apply |
| Focus not obscured | Focused component must not be entirely hidden by author-created content |

## HTML And Semantics

- Use semantic elements: `button`, `a`, `input`, `select`, `textarea`, `label`, `fieldset`, `legend`, `table`, headings, lists, landmarks.
- Use a real `button` for actions and a real `a href` for navigation.
- Do not emulate controls with `div` or `span` unless necessary. If custom controls are necessary, expose name, role, state, value, and keyboard behavior.
- Keep heading order meaningful; do not choose heading levels only for visual size.
- Ensure visible labels and accessible names match, especially for voice control users.
- Mark decorative images with empty `alt=""`; provide useful alternatives for meaningful images, icons, charts, and image buttons.

Relevant criteria: `1.1.1`, `1.3.1`, `1.3.2`, `2.4.6`, `2.5.3`, `3.3.2`, `4.1.2`.

## Visual Design

- Do not convey meaning with color alone. Pair color with text, icon shape, pattern, or other non-color cue.
- Check text contrast against the actual background state, including hover, disabled-looking enabled states, selected states, and overlays.
- Check borders, focus rings, icons, charts, input outlines, toggles, and state indicators against `3:1` non-text contrast.
- Avoid text baked into images. If unavoidable, provide real text alternatives and consider responsive scaling.
- Support resize and zoom without clipping, horizontal page scrolling, hidden controls, or overlapping text.
- Do not use negative letter spacing that harms readability.

Relevant criteria: `1.4.1`, `1.4.3`, `1.4.4`, `1.4.5`, `1.4.10`, `1.4.11`, `1.4.12`.

## Keyboard And Focus

- Every interactive feature must work with keyboard alone.
- Tab order must follow the visual and logical reading order.
- Do not trap focus in a component unless it is a modal/dialog pattern with a working escape or close path.
- Focus indicators must be visible and not removed by CSS.
- Sticky headers, cookie banners, bottom sheets, chat widgets, and modals must not fully cover the focused component.
- After opening a modal, move focus into it; after closing it, return focus to the triggering control.
- For menus, comboboxes, tabs, accordions, and dialogs, follow established ARIA patterns instead of inventing key behavior.

Relevant criteria: `2.1.1`, `2.1.2`, `2.4.3`, `2.4.7`, `2.4.11`, `2.4.12`, `2.4.13`.

## Touch, Pointer, And Motion

- Do not require complex gestures when a simple tap/click alternative can perform the same function.
- For drag-and-drop, provide button, menu, keyboard, or single-pointer alternatives.
- Keep pointer targets at least `24 by 24 CSS px` for AA; prefer larger targets for mobile.
- Do not trigger destructive or hard-to-reverse actions on pointer down. Use activation on pointer up, or provide cancel/undo.
- Do not require device motion. Provide a control alternative and allow motion activation to be disabled.
- Respect reduced motion preferences for animations caused by interaction.

Relevant criteria: `2.3.3`, `2.5.1`, `2.5.2`, `2.5.4`, `2.5.7`, `2.5.8`.

## Forms, Errors, And Checkout

- Every input needs a visible label or clear instruction. Placeholder-only labels are not enough.
- Required fields, formats, constraints, and examples should be stated before submission when practical.
- Error messages must identify the field, explain the problem, and suggest a correction when known.
- Error summaries should link or move users to the relevant fields in long forms.
- For legal, financial, data-changing, deletion, or test-response flows, provide review, confirmation, correction, or reversal.
- Do not ask users to re-enter information already provided in the same process unless one of the WCAG exceptions applies.
- Keep help mechanisms in a consistent relative order across pages when they repeat.

Relevant criteria: `3.2.6`, `3.3.1`, `3.3.2`, `3.3.3`, `3.3.4`, `3.3.7`, `4.1.3`.

## Authentication

- Do not block password managers, copy/paste, or one-time-code autofill.
- Avoid cognitive-function-only tests such as memorization, puzzles, or transcription without an accessible alternative or assisting mechanism.
- Mark email, username, password, and one-time-code fields with appropriate autocomplete tokens where applicable.
- CAPTCHA must have accessible alternatives and clear purpose text.
- Error messages must not reveal sensitive information in ways that harm security.

Relevant criteria: `1.1.1`, `1.3.5`, `3.3.1`, `3.3.3`, `3.3.8`, `3.3.9`.

## Dynamic Content

- Announce important status changes with appropriate live regions or roles.
- Do not move focus unexpectedly unless it is necessary and predictable.
- Avoid automatic context changes on focus or input.
- Provide pause, stop, or hide controls for moving, blinking, scrolling, or auto-updating content when required.
- For hover/focus content, keep it dismissible, hoverable, and persistent unless an exception applies.

Relevant criteria: `1.4.13`, `2.2.2`, `3.2.1`, `3.2.2`, `3.2.5`, `4.1.3`.

## Manual Verification

Run these checks before calling a UI accessible:

- Keyboard-only path: Tab, Shift+Tab, Enter, Space, Escape, arrow keys where expected.
- Screen reader or accessibility tree check: names, roles, states, labels, errors, status messages.
- Zoom/reflow check: mobile width, 200 percent zoom, and large text settings where feasible.
- Contrast check: text, icons, borders, focus indicators, disabled/enabled states, chart markings.
- Pointer/touch check: target size, drag alternatives, cancellation, no pointer-down surprises.
- Flow check: complete form/checkout/auth process, not just a single component.
