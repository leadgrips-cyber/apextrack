-- 011_offer_events.sql
-- Implements per-offer admin-defined event tokens.
-- Replaces the single click_id UNIQUE constraint with event-aware uniqueness.

-- ── 1. offer_events table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offer_events (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id           BIGINT        NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  event_token        VARCHAR(100)  NOT NULL,
  event_name         VARCHAR(255)  NOT NULL,
  approval_mode      VARCHAR(20)   NOT NULL DEFAULT 'AUTO_APPROVE',
  publisher_payout   NUMERIC(18,6) NOT NULL DEFAULT 0,
  advertiser_revenue NUMERIC(18,6) NOT NULL DEFAULT 0,
  is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT offer_events_unique_token  UNIQUE(offer_id, event_token),
  CONSTRAINT offer_events_approval_mode CHECK (approval_mode IN ('AUTO_APPROVE', 'MANUAL_REVIEW'))
);

CREATE INDEX IF NOT EXISTS idx_offer_events_offer_id
  ON offer_events(offer_id);

CREATE INDEX IF NOT EXISTS idx_offer_events_active
  ON offer_events(offer_id, is_active)
  WHERE is_active = TRUE;

CREATE TRIGGER offer_events_updated_at
  BEFORE UPDATE ON offer_events
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── 2. Add offer_event_id FK to conversions ──────────────────────────────────
ALTER TABLE conversions
  ADD COLUMN IF NOT EXISTS offer_event_id UUID
  REFERENCES offer_events(id) ON DELETE SET NULL;

-- ── 3. Drop old single-column UNIQUE on click_id ────────────────────────────
--      Allows multiple events per click going forward.
ALTER TABLE conversions DROP CONSTRAINT IF EXISTS conversions_click_id_key;

-- ── 4a. Event-based uniqueness: one conversion per (click, event) ───────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversions_click_event
  ON conversions(click_id, offer_event_id)
  WHERE offer_event_id IS NOT NULL;

-- ── 4b. Legacy uniqueness: one conversion per click when no event is used ───
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversions_click_no_event
  ON conversions(click_id)
  WHERE offer_event_id IS NULL;
