---
name: imagegen-frontend-mobile
description: Use only when the user explicitly names taste-skill (테이스트 스킬) or "imagegen-frontend-mobile". Mobile app screen concept images only; writes no code. Requires an image generation tool. Do not auto-select for general UI work; designing-distinctive-ui owns that by default.
argument-hint: "[앱 화면 설명]"
---

# imagegen-frontend-mobile (taste-skill wrapper)

Upstream: `Leonxlnx/imagegen-skills` → `skills/imagegen-frontend-mobile`

1. Read `~/.agents/sources/Leonxlnx/imagegen-skills/skills/imagegen-frontend-mobile/SKILL.md` in full and follow it.
2. Apply the local precedence rules below when they conflict with upstream.

## Local precedence

- User and project instructions (CLAUDE.md, AGENTS.md) win. Reply to the user in Korean.
- Keep the existing stack and design system. Ask before adding dependencies such as GSAP or new web fonts.
- While this skill owns the task, do not co-own it with `designing-distinctive-ui` or `impeccable`.
- When motion or contrast conflicts with accessibility, accessibility wins (`prefers-reduced-motion`, WCAG 2.2).
