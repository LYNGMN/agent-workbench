---
name: skill-router
description: Use when starting a non-trivial task where multiple installed skills, IDE integrations, AI runtimes, or tools could plausibly apply.
---

# Skill Router

Choose the smallest non-overlapping route before acting.

## Routing Contract

1. Detect the AI runtime and host IDE separately. Treat an installed tool as active only when the current session exposes it.
2. Give explicit user-named skills precedence, followed by project instructions, the current work phase, and the narrowest domain owner. A skill named in the request by install name or registered alias (for example `taste-skill`) counts as user-named.
3. At any one time, activate **한 시점에는 소유 스킬 하나**. Hand work to another owner only when the phase changes.
4. Load **선언된 필수 의존성** automatically. A dependency supplies an engine or required check; it does not share ownership.
5. Recommend non-competing helpers only when they materially improve the result. Show 최대 2개 and do not activate them without the normal trigger or user choice.

Use this output:

```text
스킬 라우팅: <owner> → <required dependency>
추천: <inactive helper> — <material benefit>
```

Omit the recommendation line when there is no meaningful gap.

## Runtime policy

If a routing CLI such as `skill-governance` is installed, use it (`route --runtime <actual-runtime>`); otherwise apply this contract directly. Selective routing applies to Codex, Claude Code, Gemini, Antigravity and DeepSeek Harness alike. A host IDE does not determine the AI runtime.

DeepSeek Harness reads one level of `~/.dsh/skills` and then `~/.agents/skills` (`<name>/SKILL.md` or `<name>.md`; the first root wins). `~/.agents/bin/dsh-sync-skills --apply` aligns that folder with the shared shelf; a `disable-model-invocation: true` wrapper is callable only as `/<name>`.

- Clear ordinary tasks need no skill. No match is not a reason to ask a question.
- Use a process owner when intent is materially unclear, diagnosis is needed, or complexity/risk makes its procedure useful. Do not repeat an approved plan or authorization.
- Interpret bypass as execution intent, not substring presence. Quoted, descriptive, and negated expressions do not bypass. The CLI accepts `--bypass-skills true|false` for caller-interpreted intent.
- Explicit skill plus bypass keeps that owner and its mandatory engines; suppress optional recommendations and handoffs.
- Select the enabled runtime source; prefer the active plugin for duplicate local/plugin skills. A cached plugin alone is not proof of installation or session exposure.
- Do not invoke `using-superpowers` as a universal entry procedure. Retain specialized skills and proportional verification.
- Model identity does not change authorization or automatically disable skills.
- An explicit-only setting keeps a skill callable by name; an off setting makes it unavailable. Respect each runtime's effective settings instead of treating a file as active.
- Preserve the requested endpoint. Local work does not imply remote publication, a Pull Request or Merge. Carry out already authorized stages without repeated confirmation.
- Scale planning, review and verification to the changed behavior. Do not repeat passing checks without a new change, failure or unresolved concern.

## Boundaries

- This single-owner contract governs even when another process skill (such as `using-superpowers`) says to invoke every possibly relevant skill.
- Process owners are sequential: intent, planning, diagnosis, implementation, verification, and release must not compete at the same moment.
- Domain skills own specialized judgment. General process skills must not restate their domain rules.
- Tools and plugins are capabilities, not task owners. Distinguish installed, enabled, authorized, and usable in the current surface.
- Do not recommend an uninstalled plugin when an active capability already covers the request.
- Keep reusable skills global. Keep a project-local skill only when it contains repository-specific knowledge.

## Security Catalog

Keep large security and forensics catalogs outside normal discovery. Select the narrowest catalog skill only for an explicit security task with a clear authorization boundary.

If authorization is missing, stop with `security-authorization-required`; do not activate or recommend an offensive skill.

## Common Conflicts

Examples from the agent-workbench skill set. Skip a row whose skills are not installed.

| Situation | Owner | Do not co-own with |
| --- | --- | --- |
| New behavior, intent unclear | `superpowers/brainstorming` | implementation or verification skills |
| Unknown bug cause | `superpowers/systematic-debugging` | `gstack/investigate` unless browser evidence is materially needed |
| Product UI direction | `designing-distinctive-ui` | Impeccable as a second owner; it is a declared engine |
| OpenAI product behavior | `openai-docs` | generic web-search skills |
| TradingView Pine Script development | `pinescript-indicator` or `pinescript-strategy` | `pinescript-v6` as co-owner; it is a declared engine |
| User names taste-skill or one of its install names | that taste skill | `designing-distinctive-ui` or Impeccable as co-owners |
| Korean prose writing or rewriting | `korean-natural-writing` | `humanize-korean` as a second owner |
| Cloudflare Workers, D1, R2, KV, Containers design, migration or `wrangler deploy` | `cloudflare-workers-ops` → `cloud-cost-guard` | `gstack/land-and-deploy` (PR delivery flow) |
| Query, batch, backfill or queue change on metered serverless or paid APIs | `cloud-cost-guard` | `cloudflare-workers-ops` as co-owner; recommend it |
| Google Apps Script, clasp, triggers | `apps-script-ops` | `superpowers/systematic-debugging` as co-owner |
| Completion claim | `superpowers/verification-before-completion` | planning or implementation owners |
