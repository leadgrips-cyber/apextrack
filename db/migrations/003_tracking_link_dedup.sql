-- Migration 003: Add deduplication index on tracking_links
-- Prevents duplicate rows for identical (publisher_id, offer_id, sub1-sub5) combinations.
-- NULL sub values are treated as empty string via COALESCE for dedup comparisons.
-- Safe to run multiple times (IF NOT EXISTS guard on index).

-- Remove pre-existing duplicates, keeping the earliest row per combination
DELETE FROM tracking_links
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY
               publisher_id,
               offer_id,
               COALESCE(sub1, ''),
               COALESCE(sub2, ''),
               COALESCE(sub3, ''),
               COALESCE(sub4, ''),
               COALESCE(sub5, '')
             ORDER BY created_at ASC
           ) AS rn
    FROM tracking_links
  ) ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tracking_links_dedup
ON tracking_links (
  publisher_id,
  offer_id,
  COALESCE(sub1, ''),
  COALESCE(sub2, ''),
  COALESCE(sub3, ''),
  COALESCE(sub4, ''),
  COALESCE(sub5, '')
);
