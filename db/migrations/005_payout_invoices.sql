-- Migration 005: Add payout_invoices table for full invoice lifecycle management.
-- Creates invoice_status ENUM and payout_invoices table linking publishers to
-- billing period statements, with optional wallet_transaction link set on payment.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('PENDING', 'PAID', 'HOLD');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS payout_invoices (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   VARCHAR(50)   NOT NULL UNIQUE,
  publisher_id     UUID          NOT NULL REFERENCES publishers(id) ON DELETE RESTRICT,
  period_start     DATE          NOT NULL,
  period_end       DATE          NOT NULL,
  gross_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee_amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           invoice_status NOT NULL DEFAULT 'PENDING',
  payout_method    VARCHAR(100),
  notes            TEXT,
  wallet_tx_id     UUID          NULL REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  generated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  paid_at          TIMESTAMP WITH TIME ZONE NULL,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_invoices_publisher_id ON payout_invoices(publisher_id);
CREATE INDEX IF NOT EXISTS idx_payout_invoices_status       ON payout_invoices(status);
CREATE INDEX IF NOT EXISTS idx_payout_invoices_period_start ON payout_invoices(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_payout_invoices_created_at   ON payout_invoices(created_at DESC);

CREATE OR REPLACE FUNCTION update_payout_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payout_invoices_updated_at ON payout_invoices;
CREATE TRIGGER payout_invoices_updated_at
  BEFORE UPDATE ON payout_invoices
  FOR EACH ROW EXECUTE FUNCTION update_payout_invoices_timestamp();
