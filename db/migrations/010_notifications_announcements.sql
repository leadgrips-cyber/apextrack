-- Migration 010: Add notifications and announcements tables.
-- notifications: system-generated per-publisher alerts (read/unread).
-- announcements: admin-created broadcast messages shown on publisher dashboard.

CREATE TABLE IF NOT EXISTS notifications (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id      UUID         NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  message           TEXT         NOT NULL,
  is_read           BOOLEAN      NOT NULL DEFAULT FALSE,
  notification_type VARCHAR(64)  NOT NULL DEFAULT 'system',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_publisher_id
  ON notifications(publisher_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(publisher_id, is_read)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS announcements (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title                VARCHAR(255) NOT NULL,
  message              TEXT         NOT NULL,
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by_admin_id  UUID         NULL REFERENCES admins(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_is_active
  ON announcements(is_active, created_at DESC);

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
