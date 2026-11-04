---
name: wcag22-vibe-coding
description: Apply WCAG 2.2 while designing, vibe-coding, reviewing, or QA-checking web UI. Use for frontend components, landing pages, forms, dashboards, login/auth flows, mobile layouts, drag-and-drop interactions, accessibility reviews, and pre-ship WCAG 2.2 A/AA checks.
argument-hint: "[점검할 화면이나 컴포넌트]"
---

# WCAG 2.2 Vibe Coding

Use this skill to keep web UI work aligned with WCAG 2.2 while designing, implementing, reviewing, or QA-testing.

Default to **WCAG 2.2 AA** for user-facing frontend work. Treat AAA as advisory unless the user explicitly asks for AAA.

## Workflow

1. Identify the requested work: design, implementation, review, QA, or remediation.
2. Set the target level:
   - Use WCAG 2.2 AA by default.
   - Use A only when the user explicitly asks for minimum compliance.
   - Use AAA only when the user explicitly asks for enhanced guidance.
3. Read `references/coding-checklist.md` before giving accessibility guidance or writing UI code.
4. Map the task to risk areas:
   - Semantics and structure
   - Text alternatives and media
   - Contrast, text, layout, zoom, and reflow
   - Keyboard operation, focus order, focus visibility, and focus obstruction
   - Pointer, touch, target size, gestures, and drag alternatives
   - Forms, labels, errors, redundant entry, checkout, and authentication
   - Dynamic content, status messages, modals, menus, and custom components
   - Time limits, sessions, auto-updates, animation, and flashing
5. Search `references/success-criteria.md` by criterion number or title when a specific issue appears.
6. Read `references/wcag22-conformance.md` before saying a page, flow, or product "conforms" to WCAG.
7. Report findings or changes with:
   - WCAG criterion number and level
   - User impact in plain language
   - Concrete design or code change
   - Verification method

## Output Rules

- Prefer practical, implementation-ready advice over broad accessibility slogans.
- Cite criterion numbers for any accessibility requirement that blocks release.
- Separate automated checks from manual checks. Automated tools cannot prove full WCAG conformance.
- Do not treat `4.1.1 Parsing` as an active WCAG 2.2 failure. It is obsolete and removed.
- Do not make legal certification claims. State that the work supports WCAG 2.2 AA review unless a complete audited conformance process was actually performed.

## Reference Files

- `references/coding-checklist.md` - AA-first coding and review checklist.
- `references/success-criteria.md` - WCAG 2.2 success criteria summary with official links.
- `references/wcag22-conformance.md` - conformance scope, full-page and complete-process rules, and non-interference guidance.
