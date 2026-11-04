# Deploy, secrets and rollback

| Fact | First seen | Guard |
|---|---|---|
| `wrangler deploy` can fail **after** "Uploaded <worker>" (e.g. `Internal authentication error [code: 10500]` on the queues API) while the new version is already live at 100%. | 2026-10-20 | After any failed deploy run `wrangler deployments list --name <worker>` and compare the live bundle (`curl -s <site> \| grep -o '<entry>-[^"]*\.js'`) before retrying or saying "nothing changed". If live is new, only finish the missing release steps (commit, tag). |
| Editing secrets or settings in the dashboard marks the Worker `last_deployed_from: dash`; the next `wrangler deploy` shows a remote-config diff and asks `Continue? (Y/n)`, which scripts cannot answer, so the deploy aborts. | 2026-10-02 | Use `wrangler secret put` instead of the dashboard. If it already happened, run the deploy with `CI=true` (wrangler continues). |
| When several sessions deploy the same Worker from their own branches, a deploy drops the commits another session shipped in between (55 min of a feature missing). | 2026-10-21 | Right before deploying, check the live version and its commit; deploy only if your branch contains it. Prefer one integration branch (main) as the only deploy source. |
| A deploy script that times out can leave orphaned test processes running and loading the machine. | 2026-10-24 | After "deploy aborted", look for leftover runners (`pgrep -fl "[r]un-tests.mjs"`), stop them, restore the release folder, rerun. |
| Workers `fetch` throws on `redirect: 'error'`, while test fakes accepted it. | — | Use `redirect: 'manual'` and check the status; make fakes reject what the runtime rejects. |
| A date-fixed test fixture starts failing at midnight on its date (on main too). | 2026-10-01 | Derive dates from today in fixtures; suspect clock bombs first when tests fail right after midnight. |
| A wrangler OAuth token can expire between deploys: `Authentication error [code: 10000]`, and probably the same cause behind a first D1 call failing with 7403 that works on an immediate retry. | 2026-09-26, 2026-10-08 | Run `npx wrangler whoami` to refresh, then rerun the same command (the confirm digest stays valid). |
| A Worker entry module that exports anything besides `default` (e.g. a named CSP string) makes workerd refuse to start; unit tests importing the module pass. | 2026-09 | Entry exports only `default`; shared constants live in their own module; add a test that reads the entry's exports. |
| Cloudflare injects scripts in production that `wrangler dev` never serves (the Web Analytics beacon `static.cloudflareinsights.com`), so a CSP that passed locally blocked it live. | 2026-09-26 | After a CSP change, `curl` the live HTML for injected scripts and check the live page console before calling it done. |

## Labels and history
- `wrangler deploy --message "<commit sha> <summary>"` and a git tag `deploy-YYYY-MM-DD-HHMM` on the deployed commit.
- Keep a short "what is live" line per Worker (version id, commit, time) in the project's handoff document.

## Secrets
- Never print, commit or copy secret values; never ask the user to paste keys into chat.
- Agents are usually blocked from moving secrets. Give the user one script (e.g. `scripts/set-secrets.sh`) that runs `wrangler secret put` for each name; the user runs it.
- `wrangler secret put` reads a hidden prompt; pasting into it fails in the Claude app's terminal panel (2026-10-02). Have the script pipe the value from the clipboard (`pbpaste | wrangler secret put NAME`) rather than falling back to the dashboard (which causes the `Y/n` deploy stop above).
- Keys the service already stores (encrypted admin settings) are used by a server-side admin action, not re-entered for local scripts.
- When a script truly needs a key locally: read it from the clipboard (`pbpaste`), check its prefix, never echo it, clear the clipboard; do not rely on the user typing y/N (Korean input mode types `ㅛ`).

## Approval pattern that works
Auto-approval classifiers block merges, deploys, DNS/route edits, budget raises and secret copies even after a chat "yes". Prepare everything (tests, build, dry-run, digest), then hand the user one idempotent command in a visible bash block; continue after they run it.
