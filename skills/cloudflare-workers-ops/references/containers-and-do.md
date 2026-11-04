# Containers and Durable Objects

| Fact | First seen | Guard |
|---|---|---|
| Deploying only a new container image may not replace a container that is already running (`runner-N` kept the old image; a new response field never appeared). | 2026-10-22 | Change the instance name (`RUNNER_NAME`) when the image changes, and check after deploy that the new behaviour is in the response. |
| With `max_instances: 1`, the new instance cannot start until the old one is cleaned up: calls fail with `Maximum number of running container instances exceeded` for minutes (up to ~15). | 2026-10-22 | Expect the gap; deploy in a quiet window or allow 2 instances during the switch; tell the user. |
| A container that hangs during a configuration test cannot be recovered under the same name. | 2026-10-21 | Create it again under a new name. |
| Locking container internet access to the proxy address also blocked the proxy port; requests hung. | 2026-10-21, ~30 min outage | Test the egress rule against the real proxy port before deploying; keep the rule in the project's security section. |
| Rollback does not undo container images or Durable Object migrations. | project work-flow | To go back, redeploy the previous main; plan DO migrations as forward-only. |
| The Rate Limiting binding is approximate per location; 120 rapid calls got through. | 2026-10-21 | Count security limits exactly in a Durable Object. |
| Deploying with `--containers-rollout=none` keeps the old image; it is only for Worker-only changes. | 2026-10-21 | When the container image changed too, deploy without `--containers-rollout=none`. |
| Container logs are only in the dashboard; the wrangler OAuth token has no Workers Logs read permission. | 2026-10-21 | Return timings in the response (or a debug header) when measuring; ask the user for a dashboard log screenshot when needed. |

## Cost model to state before changing containers
`instance_type`, `max_instances`, idle shutdown (about 5 minutes), proxy MB per call and a daily MB cap (`--budget-mb`, `PROXY_DAILY_MB_MAX`). Write it in the cloud-cost-guard report.

## Secrets inside containers
Proxy credentials and API keys never appear in logs, metrics, docs or commits; relay code must not log the proxy URL.
