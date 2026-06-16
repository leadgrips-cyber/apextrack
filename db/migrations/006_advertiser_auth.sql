-- Migration 006: Extend advertisers table for self-service signup and auth workflow.
-- Adds password_hash (set on self-registration), country, messenger_contact,
-- and is_active (boolean auth gate: false = pending/deactivated, true = approved).
-- Safe to run multiple times (uses IF NOT EXISTS guards per column).

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advertisers' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE advertisers ADD COLUMN password_hash VARCHAR(255) NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advertisers' AND column_name = 'country'
  ) THEN
    ALTER TABLE advertisers ADD COLUMN country VARCHAR(100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advertisers' AND column_name = 'messenger_contact'
  ) THEN
    ALTER TABLE advertisers ADD COLUMN messenger_contact VARCHAR(255);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advertisers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE advertisers ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Mark any existing ACTIVE advertisers (created before this migration) as is_active = true
-- so they remain functional after the migration runs.
UPDATE advertisers SET is_active = TRUE WHERE status = 'ACTIVE' AND is_active = FALSE;

CREATE INDEX IF NOT EXISTS idx_advertisers_is_active ON advertisers(is_active);
