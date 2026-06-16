-- Add auto_approve_publishers setting to network_settings
-- When TRUE: publisher account becomes ACTIVE automatically after email verification
-- When FALSE (default): publisher remains PENDING until admin manually approves

ALTER TABLE network_settings
  ADD COLUMN IF NOT EXISTS auto_approve_publishers BOOLEAN NOT NULL DEFAULT FALSE;
