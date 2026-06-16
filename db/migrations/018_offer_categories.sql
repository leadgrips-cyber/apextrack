-- Migration 018: Offer Categories management table

CREATE TABLE IF NOT EXISTS offer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL UNIQUE,
  slug VARCHAR(128) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_categories_active ON offer_categories(is_active);

-- Backfill unique category names already in use by offers
INSERT INTO offer_categories (name, slug, is_active)
SELECT DISTINCT
  category AS name,
  lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
  TRUE AS is_active
FROM offers
WHERE category IS NOT NULL AND trim(category) <> ''
ON CONFLICT (name) DO NOTHING;
