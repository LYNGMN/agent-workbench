# Costly query shapes and their fixes

Both examples are real incidents on Cloudflare D1 (free plan, 5M rows/day).

## 1. Count per folder with a correlated subquery (read folders × videos per call)
Blocked the database on 2026-09-24: 18,272 rows per call × 152 calls.

```sql
-- BAD: re-scans the curator's whole library (and each video's labels) for every folder row
SELECT f.id, f.name,
  (SELECT COUNT(*) FROM saved_items l JOIN items w ON w.item_id = l.item_id
    WHERE l.user_id = f.user_id AND (l.folder_id IN (SELECT id FROM library_folders WHERE id = f.id OR parent_id = f.id)
      OR EXISTS (SELECT 1 FROM item_labels cv JOIN labels cl ON cl.id = cv.label_id
                 WHERE cv.item_id = l.item_id AND cl.section_id = f.id))) AS video_count
FROM library_folders f WHERE f.user_id = ?;
```
```sql
-- GOOD: two grouped passes in the same batch, merged in code; cache the counts for 60 s
SELECT l.folder_id AS id, COUNT(*) AS n FROM saved_items l JOIN items w ON w.item_id = l.item_id
  WHERE l.user_id = ? AND l.folder_id IS NOT NULL GROUP BY l.folder_id;
SELECT cl.section_id AS id, COUNT(DISTINCT l.item_id) AS n FROM saved_items l
  JOIN library_folders lf ON lf.id = l.folder_id JOIN item_labels cv ON cv.item_id = l.item_id
  JOIN labels cl ON cl.id = cv.label_id
  WHERE l.user_id = ? AND COALESCE(lf.parent_id, lf.id) <> cl.section_id GROUP BY cl.section_id;
```

## 2. Per-row extras computed before LIMIT (read every matching row × labels × label size)
Blocked the database on 2026-09-25 after an import doubled the data: 247,335 rows per page × 64 calls.

```sql
-- BAD: the label list (with a COUNT per label) is evaluated for every matching row, then sorted, then limited
SELECT v.item_id, v.title,
  (SELECT json_group_array(dl.slug) FROM item_labels dv JOIN labels dl ON dl.id = dv.label_id
     WHERE dv.item_id = r.item_id
       AND (SELECT COUNT(*) FROM item_labels sc WHERE sc.label_id = dl.id) >= 2) AS labels
FROM saved_items r JOIN items v ON v.item_id = r.item_id
WHERE r.user_id = ? ORDER BY v.published_at DESC LIMIT 51;
```
```sql
-- GOOD: pick the page first, then compute extras for those rows only;
-- the "at least 2 videos" set is one grouped query, cached, applied in code
WITH page AS MATERIALIZED (
  SELECT v.item_id, v.title, v.published_at FROM saved_items r JOIN items v ON v.item_id = r.item_id
  WHERE r.user_id = ? ORDER BY v.published_at DESC LIMIT 51)
SELECT p.*, (SELECT json_group_array(dl.slug) FROM item_labels dv JOIN labels dl ON dl.id = dv.label_id
             WHERE dv.item_id = p.item_id) AS labels
FROM page p ORDER BY p.published_at DESC;
```
Measured on 1,200 videos: 33× less work, identical output.

## Other shapes to flag
- N+1: a query per item inside a loop → one query with `json_each(?)` or `IN (...)`.
- Recounting on every write (`UPDATE ... SET n = (SELECT COUNT(*) ...)` per import request) → increment, or recount once per batch.
- Queue messages carrying many items when each item costs several queries/API calls → items per message × work per item must stay under the per-invocation limit.
- Aggregates shown on busy pages (chips, counts, previews) → Cache API for 30–60 s for every viewer; keep publish/hide state fresh.
- Admin/curator paths that skip caches → cache the aggregates, not the whole response, so edits stay visible.

## Guard tests that catch these
- Structure assertion: the list query uses a `MATERIALIZED` page CTE; no `COUNT(` inside the per-card subquery. Fails on the old shape.
- Scale comparison on seeded data (e.g. 12 vs 57 folders, 300 vs 1,200 videos) with a deterministic measure (row or step count). Avoid wall-clock thresholds: they pass on fast machines.
