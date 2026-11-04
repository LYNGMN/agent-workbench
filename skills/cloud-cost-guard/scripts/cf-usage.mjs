#!/usr/bin/env node
// Read-only Cloudflare usage check: month-to-date use of every metered Workers product against the
// Workers Paid included amounts, the month-end projection, today's D1 reads and the heaviest queries.
// It reads Cloudflare's analytics (GraphQL) only; it never changes anything. The API token comes from
// `wrangler auth token` and stays in memory (never printed).
//
// Usage (from a project that has wrangler installed, logged in to the right account):
//   CLOUDFLARE_ACCOUNT_ID=<id> node cf-usage.mjs [--threshold 25] [--daily-d1-reads 10000000] [--json]
// Exit code: 0 within limits, 2 when a projection passes --threshold % of the included amount or
// today's D1 reads pass --daily-d1-reads, 1 when the check itself failed.
import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Workers Paid included amounts per month (checked 2026-09-25; confirm on
// https://developers.cloudflare.com/workers/platform/pricing/ before relying on a number).
export const INCLUDED = {
  workerRequests: 10_000_000, workerCpuMs: 30_000_000,
  d1RowsRead: 25_000_000_000, d1RowsWritten: 50_000_000, d1StorageBytes: 5e9,
  r2StorageBytes: 10e9, r2ClassA: 1_000_000, r2ClassB: 10_000_000,
  kvReads: 10_000_000, kvWrites: 1_000_000, queueOperations: 1_000_000,
};
const R2_CLASS_A = new Set(['ListBuckets', 'PutBucket', 'ListObjects', 'PutObject', 'CopyObject', 'CompleteMultipartUpload', 'CreateMultipartUpload', 'UploadPart', 'UploadPartCopy', 'PutBucketEncryption', 'PutBucketCors', 'PutBucketLifecycleConfiguration']);

// Month-to-date use divided by the elapsed share of the month, as a percentage of the included amount.
export function projectPercent(used, included, elapsedShare) {
  if (!included) return 0;
  return (used / Math.max(elapsedShare, 1 / 720)) / included * 100;
}

function option(name, fallback) { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; }

async function main() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!account) throw new Error('Set CLOUDFLARE_ACCOUNT_ID.');
  const wrangler = resolve(option('--wrangler', 'node_modules/wrangler/bin/wrangler.js'));
  if (!existsSync(wrangler)) throw new Error(`wrangler not found at ${wrangler}; run from a project with wrangler installed or pass --wrangler.`);
  const threshold = Number(option('--threshold', '25')), dailyD1 = Number(option('--daily-d1-reads', '10000000'));
  const token = JSON.parse(execFileSync(process.execPath, [wrangler, 'auth', 'token', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: process.env })).token;
  const now = new Date(), monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const elapsedShare = (now - monthStart) / (monthEnd - monthStart);
  const date = d => d.toISOString().slice(0, 10);
  const query = `query($a:String!,$s:Date!,$u:Date!,$ds:Time!,$ut:Time!){viewer{accounts(filter:{accountTag:$a}){
    w:workersInvocationsAdaptive(limit:10000,filter:{date_geq:$s,date_leq:$u}){sum{requests cpuTimeUs}}
    d:d1AnalyticsAdaptiveGroups(limit:10000,filter:{date_geq:$s,date_leq:$u}){sum{rowsRead rowsWritten}}
    dt:d1AnalyticsAdaptiveGroups(limit:100,filter:{datetimeHour_geq:$ds,datetimeHour_leq:$ut}){sum{rowsRead}}
    ds:d1StorageAdaptiveGroups(limit:1,filter:{date_geq:$s,date_leq:$u},orderBy:[date_DESC]){max{databaseSizeBytes} dimensions{date}}
    ro:r2OperationsAdaptiveGroups(limit:10000,filter:{date_geq:$s,date_leq:$u}){sum{requests} dimensions{actionType}}
    rs:r2StorageAdaptiveGroups(limit:1,filter:{date_geq:$s,date_leq:$u},orderBy:[date_DESC]){max{payloadSize} dimensions{date}}
    k:kvOperationsAdaptiveGroups(limit:10000,filter:{date_geq:$s,date_leq:$u}){sum{requests} dimensions{actionType}}
    q:queueMessageOperationsAdaptiveGroups(limit:10000,filter:{datetime_geq:$ms,datetime_leq:$ut}){sum{billableOperations}}
    top:d1QueriesAdaptiveGroups(limit:5,filter:{datetime_geq:$ds,datetime_leq:$ut},orderBy:[sum_rowsRead_DESC]){count sum{rowsRead} dimensions{query}}
  }}}`.replace('$ut:Time!)', '$ut:Time!,$ms:Time!)');
  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { a: account, s: date(monthStart), u: date(now), ds: dayStart.toISOString(), ut: now.toISOString(), ms: monthStart.toISOString() } }),
  });
  const body = await response.json();
  if (body.errors?.length) throw new Error(`GraphQL: ${body.errors.map(e => e.message).join('; ')}`);
  const a = body.data.viewer.accounts[0];
  const sum = (rows, pick) => (rows ?? []).reduce((n, row) => n + (pick(row) ?? 0), 0);
  const r2 = { a: sum(a.ro, r => R2_CLASS_A.has(r.dimensions.actionType) ? r.sum.requests : 0), b: sum(a.ro, r => R2_CLASS_A.has(r.dimensions.actionType) ? 0 : r.sum.requests) };
  const used = {
    workerRequests: sum(a.w, r => r.sum.requests), workerCpuMs: Math.round(sum(a.w, r => r.sum.cpuTimeUs) / 1000),
    d1RowsRead: sum(a.d, r => r.sum.rowsRead), d1RowsWritten: sum(a.d, r => r.sum.rowsWritten), d1StorageBytes: a.ds?.[0]?.max?.databaseSizeBytes ?? 0,
    r2StorageBytes: a.rs?.[0]?.max?.payloadSize ?? 0, r2ClassA: r2.a, r2ClassB: r2.b,
    kvReads: sum(a.k, r => r.dimensions.actionType === 'read' ? r.sum.requests : 0), kvWrites: sum(a.k, r => ['write', 'delete', 'list'].includes(r.dimensions.actionType) ? r.sum.requests : 0),
    queueOperations: sum(a.q, r => r.sum.billableOperations),
  };
  // Storage is a level, not a monthly flow: compare it directly.
  const stock = new Set(['d1StorageBytes', 'r2StorageBytes']);
  const rows = Object.entries(INCLUDED).map(([key, included]) => ({ key, used: used[key], included,
    percent: stock.has(key) ? used[key] / included * 100 : projectPercent(used[key], included, elapsedShare) }));
  const todayD1 = sum(a.dt, r => r.sum.rowsRead);
  const alerts = [...rows.filter(row => row.percent > threshold).map(row => `${row.key} on pace for ${row.percent.toFixed(1)}% of the included amount (threshold ${threshold}%)`),
    ...(todayD1 > dailyD1 ? [`D1 rows read today ${todayD1.toLocaleString()} > ${dailyD1.toLocaleString()}`] : [])];
  const top = (a.top ?? []).map(r => ({ rowsRead: r.sum.rowsRead, calls: r.count, perCall: Math.round(r.sum.rowsRead / Math.max(1, r.count)), query: r.dimensions.query.replace(/\s+/g, ' ').slice(0, 160) }));
  if (process.argv.includes('--json')) console.log(JSON.stringify({ at: now.toISOString(), elapsedShare, rows, todayD1RowsRead: todayD1, top, alerts }, null, 2));
  else {
    console.log(`Cloudflare usage ${date(monthStart)} → ${now.toISOString().slice(0, 16)}Z (${(elapsedShare * 100).toFixed(1)}% of the month)`);
    for (const row of rows) console.log(`  ${row.key.padEnd(16)} ${String(row.used.toLocaleString()).padStart(16)} / ${row.included.toLocaleString().padEnd(16)} ${stock.has(row.key) ? 'now' : 'month-end pace'} ${row.percent.toFixed(1)}%`);
    console.log(`  D1 rows read today (since 00:00 UTC = 09:00 KST): ${todayD1.toLocaleString()}`);
    console.log('  Heaviest D1 queries today:');
    for (const t of top) console.log(`    ${String(t.rowsRead).padStart(10)} rows / ${t.calls} calls = ${t.perCall}/call | ${t.query}`);
    console.log(alerts.length ? `ALERT:\n  - ${alerts.join('\n  - ')}` : 'OK: every product is within the threshold.');
  }
  return alerts.length ? 2 : 0;
}

// Run through a symlinked skills folder too: compare real paths (10-21: the old check skipped main() and printed nothing).
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  main().then(code => process.exit(code), error => { console.error(`usage check failed: ${error.message}`); process.exit(1); });
}
