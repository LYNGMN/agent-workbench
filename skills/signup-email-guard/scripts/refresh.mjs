#!/usr/bin/env node
// Downloads the public disposable-email list again (CC0, data/disposable-source.json names it), shows what
// changed, and rewrites data/disposable-domains.txt + data/disposable-source.json. Nothing else is touched:
// run scripts/build-module.mjs afterwards for each service that vendors the list, and review the diff there.
//
// node scripts/refresh.mjs            download, compare, write
// node scripts/refresh.mjs --dry-run  download and compare only
//
// It refuses a list that shrank by more than 10 % or that names a mainstream mailbox domain (gmail.com,
// naver.com, …): a broken or tampered upstream must never start blocking ordinary people.
import { readFileSync, writeFileSync } from 'node:fs';
import { NEVER_BLOCK } from './never-block.mjs';

const root = new URL('../', import.meta.url);
const sourcePath = new URL('data/disposable-source.json', root);
const listPath = new URL('data/disposable-domains.txt', root);
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const repo = new URL(source.repo).pathname.slice(1);
const dryRun = process.argv.includes('--dry-run');

const commit = await (await fetch(`https://api.github.com/repos/${repo}/commits/main`, { headers: { accept: 'application/vnd.github+json' } })).json();
if (!/^[0-9a-f]{40}$/.test(commit?.sha ?? '')) throw new Error('could not read the upstream commit');
const response = await fetch(`https://raw.githubusercontent.com/${repo}/${commit.sha}/${source.file}`);
if (!response.ok) throw new Error(`download failed: HTTP ${response.status}`);
const lines = (await response.text()).split('\n').map(line => line.trim().toLowerCase()).filter(line => line && !line.startsWith('#'));
const bad = lines.filter(line => !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(line));
if (bad.length) throw new Error(`unexpected lines: ${bad.slice(0, 5).join(', ')}`);
const next = [...new Set(lines)].sort();
const before = readFileSync(listPath, 'utf8').split('\n').filter(Boolean);
const hit = NEVER_BLOCK.filter(domain => next.includes(domain));
if (hit.length) throw new Error(`upstream now lists mainstream mailboxes: ${hit.join(', ')}`);
if (next.length < before.length * 0.9) throw new Error(`upstream shrank from ${before.length} to ${next.length}; check it by hand`);

const old = new Set(before), now = new Set(next);
const added = next.filter(domain => !old.has(domain)), removed = before.filter(domain => !now.has(domain));
console.log(`commit ${commit.sha.slice(0, 12)} (${commit.commit?.committer?.date ?? '?'})`);
console.log(`${before.length} → ${next.length} domains: +${added.length} −${removed.length}`);
if (added.length) console.log('added (first 20):', added.slice(0, 20).join(' '));
if (removed.length) console.log('removed (first 20):', removed.slice(0, 20).join(' '));
if (dryRun) process.exit(0);

writeFileSync(listPath, next.join('\n') + '\n');
writeFileSync(sourcePath, JSON.stringify({ ...source, commit: commit.sha, commitDate: commit.commit?.committer?.date ?? null,
  fetchedAt: new Date().toISOString().slice(0, 10), count: next.length }, null, 2) + '\n');
console.log('written: data/disposable-domains.txt, data/disposable-source.json');
