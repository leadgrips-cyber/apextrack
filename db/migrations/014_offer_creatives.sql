CREATE TABLE IF NOT EXISTS offer_creatives (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id       INTEGER     NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  creative_type  VARCHAR(50) NOT NULL,
  file_url       TEXT,
  dimensions     VARCHAR(100),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_creatives_offer_id ON offer_creatives(offer_id);
