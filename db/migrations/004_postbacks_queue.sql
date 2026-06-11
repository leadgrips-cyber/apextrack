-- Migration 004: Extend postbacks table for outbound publisher callback delivery queue.
-- Adds publisher_postback_id (links queue entry to postback config) and click_id
-- (required for publisher_postback_logs FK). Both NULL-able for safe migration.
-- Adds partial index for efficient worker polling on unresolved rows only.

ALTER TABLE postbacks
  ADD COLUMN IF NOT EXISTS publisher_postback_id UUID NULL
    REFERENCES publisher_postbacks(id) ON DELETE SET NULL;

ALTER TABLE postbacks
  ADD COLUMN IF NOT EXISTS click_id UUID NULL
    REFERENCES clicks(click_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_postbacks_publisher_postback_id
  ON postbacks(publisher_postback_id);

CREATE INDEX IF NOT EXISTS idx_postbacks_click_id
  ON postbacks(click_id);

CREATE INDEX IF NOT EXISTS idx_postbacks_worker_poll
  ON postbacks(next_retry_at ASC)
  WHERE status IN ('QUEUED', 'RETRY');
