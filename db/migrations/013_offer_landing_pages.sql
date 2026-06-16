CREATE TABLE IF NOT EXISTS offer_landing_pages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id    INTEGER     NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  url         TEXT        NOT NULL,
  preview_url TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_landing_pages_offer_id ON offer_landing_pages(offer_id);
