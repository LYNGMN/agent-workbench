# WCAG 2.2 Conformance Notes

Official sources:

- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- How to Meet WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- Understanding WCAG 2.2: https://www.w3.org/WAI/WCAG22/Understanding/

## Guidance Layers

WCAG 2.2 is organized into layers:

- **Principles**: Perceivable, Operable, Understandable, Robust.
- **Guidelines**: broad accessibility goals under each principle.
- **Success criteria**: testable requirements with levels A, AA, and AAA.
- **Techniques and failures**: informative implementation guidance in the official Quick Reference and Understanding documents.

For vibe coding and frontend review, treat success criteria as requirements and techniques as implementation guidance. A different technique can still be valid when the success criterion is satisfied.

## Target Level

- **Level A**: minimum baseline.
- **Level AA**: default target for practical product work.
- **Level AAA**: enhanced guidance; do not require for whole sites unless the user explicitly asks.

For WCAG 2.2 AA, a page must satisfy all Level A and Level AA success criteria, or provide a conforming alternate version.

## Conformance Scope

Do not claim conformance from a partial component check.

WCAG conformance applies to:

- **Full pages**, not selected parts of a page.
- **Complete processes**, not one screen inside a multi-step flow.
- **Responsive variations**, including mobile and desktop variants.
- **Accessibility-supported technology use**, meaning required information and functionality must work in ways supported by users' assistive technologies and browsers.
- **Non-interference**, meaning non-conforming or unsupported content must not block access to the rest of the page.

Complete-process examples:

- Checkout from cart to payment confirmation.
- Account creation from sign-up form to email verification.
- Password reset from request to completion.
- Multi-step lead form or booking flow.

## Non-Interference Criteria

These apply to all content on the page, even content not otherwise relied upon for conformance:

- `1.4.2 Audio Control`
- `2.1.2 No Keyboard Trap`
- `2.3.1 Three Flashes or Below Threshold`
- `2.2.2 Pause, Stop, Hide`

If a carousel, ad, embedded widget, video, animation, or modal violates these, the page can fail even when the main content looks accessible.

## WCAG 2.2 Updates

WCAG 2.2 adds these success criteria:

- `2.4.11 Focus Not Obscured (Minimum)` - AA
- `2.4.12 Focus Not Obscured (Enhanced)` - AAA
- `2.4.13 Focus Appearance` - AAA
- `2.5.7 Dragging Movements` - AA
- `2.5.8 Target Size (Minimum)` - AA
- `3.2.6 Consistent Help` - A
- `3.3.7 Redundant Entry` - A
- `3.3.8 Accessible Authentication (Minimum)` - AA
- `3.3.9 Accessible Authentication (Enhanced)` - AAA

`4.1.1 Parsing` is obsolete and removed in WCAG 2.2. Do not report active failures against `4.1.1`; report concrete effects under criteria such as `1.3.1`, `2.1.1`, `2.4.3`, `4.1.2`, or `4.1.3`.

## Claim Language

Use careful wording:

- Safe: "This change addresses WCAG 2.2 AA risks for keyboard access, labels, and error messaging."
- Safe: "This review found issues against WCAG 2.2 AA criteria."
- Unsafe: "This product is WCAG certified."
- Unsafe without full audit: "This page conforms to WCAG 2.2 AA."

When the user asks for certification or legal compliance, explain that this skill supports implementation and review, but a formal conformance claim requires a complete page/process audit with documented scope, tested technologies, and known limitations.
