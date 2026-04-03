-- One-time patch for databases created from older schema.sql (column `read`, missing soft-delete / read_at).
-- Safe to run on fresh DBs that already match schema.sql (statements are idempotent where possible).

-- ── notifications ─────────────────────────────────────────────────────────────
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE notifications RENAME COLUMN read TO is_read;
  END IF;
END $$;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;

-- ── messages ────────────────────────────────────────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_recipient BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE messages RENAME COLUMN read TO is_read;
  END IF;
END $$;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
UPDATE messages SET is_read = FALSE WHERE is_read IS NULL;

-- Recreate indexes if names exist with old columns (optional cleanup)
DROP INDEX IF EXISTS idx_notifications_user_read;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

DROP INDEX IF EXISTS idx_messages_recipient;
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read);
