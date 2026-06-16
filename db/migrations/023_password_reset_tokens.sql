CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type  VARCHAR(20)  NOT NULL CHECK (user_type IN ('publisher', 'advertiser')),
  user_id    UUID         NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,
  used_at    TIMESTAMPTZ  DEFAULT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens (user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_prt_hash ON password_reset_tokens (token_hash);
