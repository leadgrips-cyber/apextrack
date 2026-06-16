CREATE TABLE IF NOT EXISTS offer_caps (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id              INTEGER     NOT NULL UNIQUE REFERENCES offers(id) ON DELETE CASCADE,
  daily_click_cap       INTEGER     CHECK (daily_click_cap IS NULL OR daily_click_cap >= 0),
  hourly_click_cap      INTEGER     CHECK (hourly_click_cap IS NULL OR hourly_click_cap >= 0),
  daily_conversion_cap  INTEGER     CHECK (daily_conversion_cap IS NULL OR daily_conversion_cap >= 0),
  hourly_conversion_cap INTEGER     CHECK (hourly_conversion_cap IS NULL OR hourly_conversion_cap >= 0),
  is_active             BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_offer_caps_offer_id
  ON offer_caps(offer_id);
