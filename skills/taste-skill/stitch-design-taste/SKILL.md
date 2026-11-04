---
name: stitch-design-taste
description: Use only when the user explicitly names taste-skill (테이스트 스킬) or "stitch-design-taste". Generates Google Stitch-compatible DESIGN.md rules. Do not auto-select for general UI work; designing-distinctive-ui owns that by default.
argument-hint: "[디자인 규칙을 만들 서비스]"
---

# stitch-design-taste (taste-skill wrapper)

Upstream: `Leonxlnx/taste-skill-classics` → `skills/stitch-skill`

1. Read `~/.agents/sources/Leonxlnx/taste-skill-classics/skills/stitch-skill/SKILL.md` in full and follow it. Its reference file is `~/.agents/sources/Leonxlnx/taste-skill-classics/skills/stitch-skill/DESIGN.md`.
2. Apply the local precedence rules below when they conflict with upstream.

## Local precedence

- User and project instructions (CLAUDE.md, AGENTS.md) win. Reply to the user in Korean.
- Keep the existing stack and design system. Ask before adding dependencies such as GSAP or new web fonts.
- While this skill owns the task, do not co-own it with `designing-distinctive-ui` or `impeccable`.
- When motion or contrast conflicts with accessibility, accessibility wins (`prefers-reduced-motion`, WCAG 2.2).
