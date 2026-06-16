-- Phase 14C: Email Verification + Turnstile

ALTER TABLE publishers
  ADD COLUMN IF NOT EXISTS email_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

ALTER TABLE advertisers
  ADD COLUMN IF NOT EXISTS email_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type  VARCHAR(20) NOT NULL CHECK (user_type IN ('publisher', 'advertiser')),
  user_id    UUID        NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evt_token_hash ON email_verification_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_evt_expires_at  ON email_verification_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_evt_user        ON email_verification_tokens (user_type, user_id);

ALTER TABLE network_settings
  ADD COLUMN IF NOT EXISTS email_verification_required BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS turnstile_enabled           BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS turnstile_site_key          VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS turnstile_secret_key        VARCHAR(255) NOT NULL DEFAULT '';
