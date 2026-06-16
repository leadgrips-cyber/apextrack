CREATE TABLE IF NOT EXISTS offer_publisher_assignments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id             INTEGER     NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  publisher_id         UUID        NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  assigned_by_admin_id TEXT,
  assigned_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offer_id, publisher_id)
);

CREATE INDEX IF NOT EXISTS idx_opa_offer_id     ON offer_publisher_assignments(offer_id);
CREATE INDEX IF NOT EXISTS idx_opa_publisher_id ON offer_publisher_assignments(publisher_id);
