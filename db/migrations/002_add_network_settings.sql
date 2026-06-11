-- Migration 002: Add network_settings singleton table for white-label branding and tracking domain config
-- Safe to run multiple times (IF NOT EXISTS guards on all DDL).
-- After running, the application reads branding from this table instead of hardcoded strings.

CREATE TABLE IF NOT EXISTS network_settings (
  id               SERIAL PRIMARY KEY,
  network_name     VARCHAR(100)  NOT NULL DEFAULT 'ApexTrack',
  tracking_domain  VARCHAR(255)  NOT NULL DEFAULT 'http://localhost:3000',
  login_domain     VARCHAR(255)  NULL,
  support_email    VARCHAR(255)  NULL,
  logo_url         TEXT          NULL,
  favicon_url      TEXT          NULL,
  login_bg_url     TEXT          NULL,
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by_admin_id TEXT       NULL
);

CREATE INDEX IF NOT EXISTS idx_network_settings_id ON network_settings(id);

-- Seed the single row if it does not exist yet.
-- ON CONFLICT (id) DO NOTHING keeps this idempotent.
INSERT INTO network_settings (id, network_name, tracking_domain)
VALUES (1, 'ApexTrack', 'http://localhost:3000')
ON CONFLICT (id) DO NOTHING;
