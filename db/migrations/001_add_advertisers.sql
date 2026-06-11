-- Migration 001: Add advertisers table and link offers to advertisers
-- Run this against an existing database that was created from the original schema.
-- Safe to run multiple times (uses IF NOT EXISTS / DO $$ guards).

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advertiser_status') THEN
    CREATE TYPE advertiser_status AS ENUM ('ACTIVE', 'PAUSED', 'SUSPENDED', 'PENDING');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(64),
  website VARCHAR(512),
  status advertiser_status NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  created_by_admin_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_advertisers_email ON advertisers(email);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'advertiser_id'
  ) THEN
    ALTER TABLE offers ADD COLUMN advertiser_id UUID NULL REFERENCES advertisers(id) ON DELETE SET NULL;
    CREATE INDEX idx_offers_advertiser_id ON offers(advertiser_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_advertisers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS advertisers_updated_at ON advertisers;
CREATE TRIGGER advertisers_updated_at
  BEFORE UPDATE ON advertisers
  FOR EACH ROW EXECUTE FUNCTION update_advertisers_timestamp();
