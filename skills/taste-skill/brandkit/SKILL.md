---
name: brandkit
description: Use only when the user explicitly names taste-skill (테이스트 스킬) or "brandkit". Brand-kit board images only; writes no code. Requires an image generation tool. Do not auto-select for general UI work; designing-distinctive-ui owns that by default.
argument-hint: "[브랜드 이름과 분위기]"
---

# brandkit (taste-skill wrapper)

Upstream: `Leonxlnx/imagegen-skills` → `skills/brandkit`

1. Read `~/.agents/sources/Leonxlnx/imagegen-skills/skills/brandkit/SKILL.md` in full and follow it.
2. Apply the local precedence rules below when they conflict with upstream.

## Local precedence

- User and project instructions (CLAUDE.md, AGENTS.md) win. Reply to the user in Korean.
- Keep the existing stack and design system. Ask before adding dependencies such as GSAP or new web fonts.
- While this skill owns the task, do not co-own it with `designing-distinctive-ui` or `impeccable`.
- When motion or contrast conflicts with accessibility, accessibility wins (`prefers-reduced-motion`, WCAG 2.2).
