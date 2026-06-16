-- Migration 009: Add REVIEW_QUEUE status to conversion_status enum
-- and create conversion_status_history audit table.

-- Step 1: Add REVIEW_QUEUE to the enum (safe, irreversible but harmless).
-- PostgreSQL requires ALTER TYPE ADD VALUE outside a transaction block,
-- so we use IF NOT EXISTS to make this idempotent.
ALTER TYPE conversion_status ADD VALUE IF NOT EXISTS 'REVIEW_QUEUE';

-- Step 2: Create audit history table for conversion status changes.
CREATE TABLE IF NOT EXISTS conversion_status_history (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id    UUID         NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  old_status       VARCHAR(30)  NULL,
  new_status       VARCHAR(30)  NOT NULL,
  changed_by_admin_id UUID     NULL REFERENCES admins(id) ON DELETE SET NULL,
  changed_by_email VARCHAR(255) NULL,
  reason           TEXT         NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csh_conversion_id
  ON conversion_status_history(conversion_id);

CREATE INDEX IF NOT EXISTS idx_csh_created_at
  ON conversion_status_history(created_at DESC);
