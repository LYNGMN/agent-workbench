---
name: redesign-existing-projects
description: Use only when the user explicitly names taste-skill (테이스트 스킬) or "redesign-existing-projects". Audits and upgrades an existing site's design without breaking functionality. Do not auto-select for general UI work; designing-distinctive-ui owns that by default.
argument-hint: "[다시 디자인할 사이트나 경로]"
---

# redesign-existing-projects (taste-skill wrapper)

Upstream: `Leonxlnx/taste-skill` → `skills/taste-skill`

1. Read `~/.agents/sources/Leonxlnx/taste-skill/skills/taste-skill/SKILL.md` in full and follow its redesign route (upstream retired `redesign-skill` in 2.1.1 and folded it into `design-taste-frontend`).
2. Apply the local precedence rules below when they conflict with upstream.

## Local precedence

- User and project instructions (CLAUDE.md, AGENTS.md) win. Reply to the user in Korean.
- Keep the existing stack and design system. Ask before adding dependencies such as GSAP or new web fonts.
- While this skill owns the task, do not co-own it with `designing-distinctive-ui` or `impeccable`.
- When motion or contrast conflicts with accessibility, accessibility wins (`prefers-reduced-motion`, WCAG 2.2).
