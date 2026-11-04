---
name: apps-script-ops
description: Use when writing, changing, pushing or debugging Google Apps Script (clasp, .clasp.json, appsscript.json, time-driven or sheet triggers, UrlFetchApp, PropertiesService, sheet menus, Telegram/Discord/Bluesky senders), especially before `clasp push`, when a run hits "Exceeded maximum execution time", when triggers overlap, or when two folders share one scriptId.
argument-hint: "[스크립트 폴더나 증상]"
---

# Apps Script Ops

## Overview
`clasp push` is a production deploy: the next trigger run uses the new code. There is no staging, a run stops at 6 minutes, and a second local copy with the same scriptId can silently undo a fix. **Know which folder is the live copy, push only that, and keep every run inside a time budget.**

**Project rules come first.** If the folder that holds your Apps Script projects has an `AGENTS.md` (folders, deploy gate, code rules, report format, "작업하며 배운 것"), read it in full before working; this skill adds the commands and code shapes to follow it. Sub-folder `AGENTS.md` files are more specific. A sub-folder that is its own Git repo needs an `AGENTS.md -> ../AGENTS.md` link (listed in `.git/info/exclude`), or Codex, Antigravity and DeepSeek Harness never see the parent file.

## Before `clasp push` (as commands)
```bash
# 1. Every local copy of this script (more than one → decide the live copy first)
grep -rl --include=.clasp.json '"scriptId": *"<SCRIPT_ID>"' <Apps Script 폴더>
ls -l <each folder>; git -C <each folder> log -1 --format='%ci %s' 2>/dev/null
# 2. Signed-in account
clasp show-authorized-user
# 3. What will be pushed (compare with the live project when unsure)
clasp status
```
Then tell the user which script, what is and is not included, and any trigger changes; push only after their go-ahead. After the push, check one real run in the editor's Executions view, or report "미확인".

The live copy is chosen by modification time and `git log`, never by guess (a wrong guess was reported once on 2026-10-24). Move the other copy to `(보관) <name>-<date>` and rename its `.clasp.json` to `.clasp.json.보관`.

## Code shapes 
```javascript
const RUN_BUDGET_MS = 5 * 60 * 1000; // stop well before the 6-minute limit

function main() {
  const startedAt = Date.now();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 1000)) return; // another trigger is running on the same sheet
  try {
    const items = loadPendingItems();
    for (const item of items) {
      if (Date.now() - startedAt > RUN_BUDGET_MS) break; // the next run continues
      processItem(item);
      markDone(item);
    }
  } finally {
    lock.releaseLock();
  }
}

function fetchJson(url) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    console.warn('fetch failed', res.getResponseCode(), url);
    return null;
  }
  return JSON.parse(res.getContentText());
}

function botToken() {
  return PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
}
```
- Save progress (`markDone`) per item, so a stop at the limit loses at most one item.
- Secrets found in code: ask before moving them; the user registers the script property.

## Diagnosing
| Symptom | First check |
|---|---|
| "Exceeded maximum execution time" | Which triggers run in the same window (Triggers page)? Is there a time budget and a lock? |
| A fix "came back" | Two copies with one scriptId (command 1 above); which one was pushed last? |
| Permission / Drive ACL error | `clasp show-authorized-user` vs the file owner |
| One bad API response stops the run | `fetch` without `muteHttpExceptions` |

## Red flags
Two `.clasp.json` with one scriptId · pushing from a `(보관)` folder or an app scratch folder · a loop over all rows with no time check · a trigger added without reporting it · a token string in a `.gs` file · a menu item named after a date or incident.

New lessons go to the project `AGENTS.md` "작업하며 배운 것" (`fact — first seen — guard`), not here.
