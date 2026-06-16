-- Migration 007: Add offer_logo_url and conversion_approval_mode to offers table.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'offer_logo_url'
  ) THEN
    ALTER TABLE offers ADD COLUMN offer_logo_url TEXT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'conversion_approval_mode'
  ) THEN
    ALTER TABLE offers ADD COLUMN conversion_approval_mode VARCHAR(20) NOT NULL DEFAULT 'AUTO_APPROVE';
  END IF;
END $$;
