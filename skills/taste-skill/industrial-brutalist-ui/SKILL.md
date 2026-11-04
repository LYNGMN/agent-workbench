---
name: industrial-brutalist-ui
description: Use only when the user explicitly names taste-skill (테이스트 스킬) or "industrial-brutalist-ui". Raw Swiss/terminal brutalist interfaces (beta). Do not auto-select for general UI work; designing-distinctive-ui owns that by default.
argument-hint: "[만들 화면 설명]"
---

# industrial-brutalist-ui (taste-skill wrapper)

Upstream: `Leonxlnx/taste-skill-classics` → `skills/brutalist-skill`

1. Read `~/.agents/sources/Leonxlnx/taste-skill-classics/skills/brutalist-skill/SKILL.md` in full and follow it.
2. Apply the local precedence rules below when they conflict with upstream.

## Local precedence

- User and project instructions (CLAUDE.md, AGENTS.md) win. Reply to the user in Korean.
- Keep the existing stack and design system. Ask before adding dependencies such as GSAP or new web fonts.
- While this skill owns the task, do not co-own it with `designing-distinctive-ui` or `impeccable`.
- When motion or contrast conflicts with accessibility, accessibility wins (`prefers-reduced-motion`, WCAG 2.2).
