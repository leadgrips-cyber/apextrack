-- Migration: Add advertiser_payout and affiliate_payout columns to offers table
-- System profit = advertiser_payout - affiliate_payout

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS advertiser_payout NUMERIC(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS affiliate_payout  NUMERIC(18,2) NOT NULL DEFAULT 0;

-- Backfill: use existing payout_amount as the affiliate payout
UPDATE offers SET affiliate_payout = ROUND(payout_amount::NUMERIC, 2) WHERE affiliate_payout = 0;
