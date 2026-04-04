-- ============================================================
-- Migration 004: Sub Briefings feature
-- Run once against your NeonDB PostgreSQL database.
-- ============================================================

-- 1. Add school_id to timetable_slots if not already present
ALTER TABLE timetable_slots
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- 2. sub_briefings table – AI-generated briefing for a substitute teacher
CREATE TABLE IF NOT EXISTS sub_briefings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  substitution_id UUID        NOT NULL UNIQUE REFERENCES substitutions(id) ON DELETE CASCADE,
  content         JSONB       NOT NULL,        -- structured class data snapshot
  ai_summary      TEXT        NOT NULL,        -- Claude narrative (≤120 words)
  is_viewed       BOOLEAN     DEFAULT FALSE,
  viewed_at       TIMESTAMPTZ,
  generated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index for quick lookup by substitution
CREATE INDEX IF NOT EXISTS idx_sub_briefings_substitution
  ON sub_briefings(substitution_id);

-- 4. Back-fill school_id on existing timetable_slots rows via class → school
UPDATE timetable_slots ts
SET    school_id = c.school_id
FROM   classes c
WHERE  ts.class_id = c.id
  AND  ts.school_id IS NULL;
