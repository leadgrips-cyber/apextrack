-- ApexTrack PostgreSQL database schema
-- Backend architecture foundation for affiliate tracking, approvals, S2S postbacks, wallets, and admin controls.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enumerated status sets for strong domain rules.
CREATE TYPE publisher_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'DEACTIVATED');
CREATE TYPE offer_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXHAUSTED', 'CLOSED', 'ARCHIVED');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE conversion_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISPUTED', 'PAID');
CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT', 'HOLD', 'RELEASE', 'WITHDRAWAL', 'REFUND', 'ADJUSTMENT');
CREATE TYPE postback_status AS ENUM ('QUEUED', 'SENT', 'SUCCESS', 'FAILED', 'RETRY', 'DISABLED');
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'AFFILIATE_MANAGER', 'FINANCE', 'SUPPORT', 'TECHNICAL');

-- Admin users for operations and approvals.
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'SUPPORT',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  password_hash TEXT NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE NULL,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(is_active);

-- Publishers / affiliates.
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  login_name VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  country_code CHAR(2),
  timezone VARCHAR(64),
  account_status publisher_status NOT NULL DEFAULT 'PENDING',
  approval_status application_status NOT NULL DEFAULT 'PENDING',
  assigned_manager_id UUID NULL REFERENCES admins(id) ON DELETE SET NULL,
  affiliate_code VARCHAR(64) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  requires_2fa BOOLEAN NOT NULL DEFAULT FALSE,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  profile_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  rejected_reason TEXT NULL
);

CREATE INDEX idx_publishers_status ON publishers(account_status);
CREATE INDEX idx_publishers_approval_status ON publishers(approval_status);
CREATE INDEX idx_publishers_country ON publishers(country_code);

-- Offer catalog.
CREATE TABLE offers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(128) NOT NULL,
  status offer_status NOT NULL DEFAULT 'DRAFT',
  requires_publisher_approval BOOLEAN NOT NULL DEFAULT FALSE,
  payout_type VARCHAR(10) NOT NULL CHECK (payout_type IN ('CPA', 'CPL', 'CPS', 'CPI', 'CPC', 'FLAT')),
  payout_amount NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  target_geos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  target_devices TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  landing_page_url TEXT NOT NULL,
  preview_url TEXT,
  terms TEXT,
  caps JSONB,
  traffic_rules JSONB,
  tracking_protocol VARCHAR(24) NOT NULL DEFAULT 'S2S' CHECK (tracking_protocol IN ('S2S', 'COOKIE', 'PIXEL', 'SERVER')),
  admin_notes TEXT,
  default_affiliate_commission NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  created_by_admin_id UUID NULL REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_payout_type ON offers(payout_type);
CREATE INDEX idx_offers_geos ON offers USING gin(target_geos);
CREATE INDEX idx_offers_devices ON offers USING gin(target_devices);

-- Publisher applications to access offers.
CREATE TABLE offer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'PENDING',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE NULL,
  reviewed_by_admin_id UUID NULL REFERENCES admins(id) ON DELETE SET NULL,
  rejection_reason TEXT NULL,
  comments TEXT NULL,
  submission_data JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (offer_id, publisher_id)
);

CREATE INDEX idx_offer_applications_offer_id ON offer_applications(offer_id);
CREATE INDEX idx_offer_applications_publisher_id ON offer_applications(publisher_id);
CREATE INDEX idx_offer_applications_status ON offer_applications(status);

-- Click events for affiliate tracking.
CREATE TABLE clicks (
  click_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE RESTRICT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  redirect_url TEXT NOT NULL,
  landing_page_url TEXT NOT NULL,
  click_ip INET NOT NULL,
  country_code CHAR(2),
  device_type VARCHAR(64),
  browser VARCHAR(128),
  os VARCHAR(128),
  user_agent TEXT,
  referrer TEXT,
  sub1 VARCHAR(255),
  sub2 VARCHAR(255),
  sub3 VARCHAR(255),
  sub4 VARCHAR(255),
  sub5 VARCHAR(255),
  is_fraud BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_offer_id ON clicks(offer_id);
CREATE INDEX idx_clicks_publisher_id ON clicks(publisher_id);
CREATE INDEX idx_clicks_created_at ON clicks(created_at DESC);
CREATE INDEX idx_clicks_ip ON clicks(click_ip);
CREATE INDEX idx_clicks_country ON clicks(country_code);

-- Conversions mapped to click records.
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id UUID NOT NULL UNIQUE REFERENCES clicks(click_id) ON DELETE RESTRICT,
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE RESTRICT,
  conversion_type VARCHAR(64) NOT NULL,
  conversion_status conversion_status NOT NULL DEFAULT 'PENDING',
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE NULL,
  rejected_at TIMESTAMP WITH TIME ZONE NULL,
  rejection_reason TEXT NULL,
  payout_amount NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  revenue_amount NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  revenue_currency CHAR(3) NOT NULL DEFAULT 'USD',
  external_reference VARCHAR(255),
  security_token VARCHAR(128) NULL,
  s2s_payload JSONB NULL,
  postback_sent_at TIMESTAMP WITH TIME ZONE NULL,
  postback_response_code INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversions_offer_id ON conversions(offer_id);
CREATE INDEX idx_conversions_publisher_id ON conversions(publisher_id);
CREATE INDEX idx_conversions_status ON conversions(conversion_status);
CREATE INDEX idx_conversions_event_timestamp ON conversions(event_timestamp DESC);

-- Wallet balance for each publisher.
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL UNIQUE REFERENCES publishers(id) ON DELETE CASCADE,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  available_balance NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  pending_balance NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  withdrawn_balance NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  hold_balance NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  reserved_balance NUMERIC(18,6) NOT NULL DEFAULT 0.000000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_publisher_id ON wallets(publisher_id);

-- Wallet transaction ledger entries.
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  conversion_id UUID NULL REFERENCES conversions(id) ON DELETE SET NULL,
  offer_id BIGINT NULL REFERENCES offers(id) ON DELETE SET NULL,
  transaction_type wallet_transaction_type NOT NULL,
  amount NUMERIC(18,6) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  balance_after NUMERIC(18,6) NOT NULL,
  reference_id UUID NULL,
  reference_type VARCHAR(64) NULL,
  description TEXT NOT NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_publisher_id ON wallet_transactions(publisher_id);
CREATE INDEX idx_wallet_transactions_conversion_id ON wallet_transactions(conversion_id);
CREATE INDEX idx_wallet_transactions_transaction_type ON wallet_transactions(transaction_type);

-- Server-to-server postback tracking.
CREATE TABLE postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE RESTRICT,
  destination_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  status postback_status NOT NULL DEFAULT 'QUEUED',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE NULL,
  next_retry_at TIMESTAMP WITH TIME ZONE NULL,
  last_response_code INTEGER NULL,
  last_response_body TEXT NULL,
  http_method VARCHAR(10) NOT NULL DEFAULT 'GET',
  headers JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_postbacks_conversion_id ON postbacks(conversion_id);
CREATE INDEX idx_postbacks_status ON postbacks(status);
CREATE INDEX idx_postbacks_offer_id ON postbacks(offer_id);

-- Publisher-managed callback URLs and logs.
CREATE TABLE publisher_postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  offer_id BIGINT NULL REFERENCES offers(id) ON DELETE CASCADE,
  callback_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publisher_postbacks_publisher_id ON publisher_postbacks(publisher_id);
CREATE INDEX idx_publisher_postbacks_offer_id ON publisher_postbacks(offer_id);

CREATE TABLE publisher_postback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_postback_id UUID NOT NULL REFERENCES publisher_postbacks(id) ON DELETE CASCADE,
  conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  click_id UUID NOT NULL REFERENCES clicks(click_id) ON DELETE CASCADE,
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  request_url TEXT NOT NULL,
  response_code INTEGER NULL,
  response_body TEXT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publisher_postback_logs_postback_id ON publisher_postback_logs(publisher_postback_id);
CREATE INDEX idx_publisher_postback_logs_conversion_id ON publisher_postback_logs(conversion_id);

CREATE TRIGGER publisher_postbacks_updated_at BEFORE UPDATE ON publisher_postbacks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER publisher_postback_logs_updated_at BEFORE UPDATE ON publisher_postback_logs FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Stored publisher tracking links.
CREATE TABLE tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  sub1 VARCHAR(255),
  sub2 VARCHAR(255),
  sub3 VARCHAR(255),
  sub4 VARCHAR(255),
  sub5 VARCHAR(255),
  tracking_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_links_publisher_id ON tracking_links(publisher_id);
CREATE INDEX idx_tracking_links_offer_id ON tracking_links(offer_id);

CREATE TRIGGER tracking_links_updated_at BEFORE UPDATE ON tracking_links FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- API tokens for publisher and admin integrations.
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  publisher_id UUID NULL REFERENCES publishers(id) ON DELETE CASCADE,
  admin_id UUID NULL REFERENCES admins(id) ON DELETE CASCADE,
  description TEXT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  last_used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_tokens_publisher_id ON api_tokens(publisher_id);
CREATE INDEX idx_api_tokens_admin_id ON api_tokens(admin_id);
CREATE INDEX idx_api_tokens_is_active ON api_tokens(is_active);
CREATE INDEX idx_api_tokens_expires_at ON api_tokens(expires_at);

-- Trigger helper to track updated_at automatically.
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER publishers_updated_at BEFORE UPDATE ON publishers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER offer_applications_updated_at BEFORE UPDATE ON offer_applications FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER clicks_updated_at BEFORE UPDATE ON clicks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER conversions_updated_at BEFORE UPDATE ON conversions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER postbacks_updated_at BEFORE UPDATE ON postbacks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER api_tokens_updated_at BEFORE UPDATE ON api_tokens FOR EACH ROW EXECUTE FUNCTION update_timestamp();
