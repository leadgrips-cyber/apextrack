-- Migration 008: Backfill wallets for all active publishers that do not have one.
-- Covers publishers created before wallet auto-creation was implemented.
-- ON CONFLICT ensures this is safe to run multiple times.

INSERT INTO wallets (
  publisher_id,
  currency,
  available_balance,
  pending_balance,
  withdrawn_balance,
  hold_balance,
  reserved_balance,
  created_at,
  updated_at
)
SELECT
  p.id,
  p.currency,
  0,
  0,
  0,
  0,
  0,
  NOW(),
  NOW()
FROM publishers p
WHERE p.account_status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM wallets w WHERE w.publisher_id = p.id
  )
ON CONFLICT (publisher_id) DO NOTHING;
