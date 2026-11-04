---
name: cloudflare-workers-ops
description: Use when designing, changing, deploying or operating a Cloudflare Workers project with D1, R2, KV, Queues, Containers or Durable Objects — new resources and their names, D1 schema, migrations or queries, storage layout, container images, wrangler deploy, secrets, or diagnosing a deploy that "failed" or a production-only error that local tests did not catch. Holds lessons from the user's own incidents; cost and read budgets belong to cloud-cost-guard.
argument-hint: "[Worker 이름이나 작업]"
---

# Cloudflare Workers Ops (lessons from our own incidents)

## Overview
Local tests run on SQLite and fakes; production runs on D1, real containers and a deploy pipeline that can stop halfway. Almost every incident behind this skill passed every local test first. **Before a change ships, check it against the production limit that local tools do not enforce, and before a deploy, check what is live right now.**

Required dependency: **cloud-cost-guard** for any query, batch, queue, cron, container instance or paid API change (cost per call, guard test, stop line). Commands: `wrangler` skill in a project with a wrangler config, `cf-cli` for a new project; platform API questions: `workers-best-practices`, `durable-objects`.

## Before you change something
| Changing | Read first | One-line rule |
|---|---|---|
| A new D1 / R2 / Queue / KV / Worker | [naming.md](references/naming.md) | D1, R2 and Queues cannot be renamed: name it `<service>-<role>` now |
| D1 schema, migration or query | [d1.md](references/d1.md) | No `WITHOUT ROWID`, ≤5 UNION terms, ≤100 result columns, one migration file at a time remotely |
| Where a result is stored | [storage-layers.md](references/storage-layers.md) | R2 body (immutable key), D1 index, KV hot list with TTL |
| Containers or Durable Objects | [containers-and-do.md](references/containers-and-do.md) | A new image may not replace a running container; bump the instance name |
| Deploy, secrets, rollback | [deploy-and-secrets.md](references/deploy-and-secrets.md) | Check the live version first; a failed deploy may already be live |
| Custom domains, routes, Access, private APIs | [access-and-domains.md](references/access-and-domains.md) | Clear proxied apex A/AAAA before a Custom Domain; turn off `workers_dev` for private APIs |
| Checking production (logs, crons, live pages) | [observing-production.md](references/observing-production.md) | `wrangler tail` shows no cron events; bot protection blocks headless checks |

## Deploy gate (every production deploy)
1. **Approval**: deploys, remote migrations, DNS/route edits, budget raises and secret changes need the user's explicit go-ahead. Prepare one idempotent command or script the user runs; agent auto-approval classifiers often block these even after a chat "yes".
2. **Live check**: `wrangler deployments list --name <worker>` → is the live version's commit contained in what you deploy? If not, another session's change would be dropped.
3. **Inputs**: related tests + build pass; cloud-cost-guard report written; migrations applied first and one file at a time.
4. **Deploy with a label**: `wrangler deploy --message "<commit>"`, then tag `deploy-YYYY-MM-DD-HHMM`.
5. **Verify live**: the changed flow in production (new field present, new bundle served). If you could not verify, say "미확인", not done.

## After an error
- "Deploy failed" → first check whether the new version is already live (see deploy-and-secrets.md) before retrying or reporting "nothing changed".
- Production-only SQL error with passing tests → run the exact generated SQL read-only on the remote DB (`wrangler d1 execute <db> --remote --command …`, with the user's approval) instead of guessing. Code that swallows the D1 message hides the reason; log it.
- A new lesson → add it to the project `AGENTS.md` "작업하며 배운 것" as `fact — first seen (date) — guard`; if it applies to every Cloudflare project, add it to the matching reference file here.

## Rationalizations
| Excuse | Reality |
|---|---|
| "Local tests pass" | Local SQLite allows 500 UNION terms and 2,000 columns; D1 allows 5 and 100. |
| "We can rename it later" | Not D1, R2 or Queues. Renaming means a new resource and a data copy. |
| "The deploy errored, so production is unchanged" | wrangler activates the script before queue/consumer steps; the new version can be live. |
| "I only rebuilt the image" | A running container keeps the old image until it is replaced. |
| "Rollback will undo it" | Rollback does not undo container images or Durable Object migrations. |
| "Rate Limiting binding protects it" | It is approximate per location; 120 rapid calls got through. Count exactly in a DO. |
| "Workers Paid has no query limit" | 1,000 queries per invocation; 10 calls × 101 statements broke it. |
| "tail shows nothing, so the cron didn't run" | `wrangler tail` does not show cron events. |

## Red flags
A UNION built from a variable-length list · a SELECT with one column per table · `WITHOUT ROWID` · `migrations apply` of several files on production · deploying a branch without checking the live commit · editing secrets in the dashboard · locking container egress without testing the proxy port · "saved" used for a KV copy that can expire.
