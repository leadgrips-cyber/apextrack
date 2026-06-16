CREATE TABLE IF NOT EXISTS offer_targeting_rules (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id   INTEGER      NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  rule_type  VARCHAR(20)  NOT NULL,
  operator   VARCHAR(10)  NOT NULL,
  rule_value VARCHAR(255) NOT NULL,
  action     VARCHAR(10)  NOT NULL DEFAULT 'BLOCK',
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(offer_id, rule_type, operator, rule_value)
);

CREATE INDEX IF NOT EXISTS idx_offer_targeting_rules_offer_id
  ON offer_targeting_rules(offer_id);

CREATE INDEX IF NOT EXISTS idx_offer_targeting_rules_active
  ON offer_targeting_rules(offer_id, is_active)
  WHERE is_active = TRUE;
