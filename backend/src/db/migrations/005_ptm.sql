-- Migration: Smart PTM Scheduler Configuration
-- Creates ENUMs and tables necessary for parent-teacher meetings and AI aggregations.

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE ptm_status_enum AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE slot_status_enum AS ENUM ('CONFIRMED', 'COMPLETED', 'MISSED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Event Table
CREATE TABLE IF NOT EXISTS ptm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    slot_duration INT NOT NULL DEFAULT 10,
    created_by_id UUID NOT NULL REFERENCES users(id),
    status ptm_status_enum NOT NULL DEFAULT 'UPCOMING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Slot Table
CREATE TABLE IF NOT EXISTS ptm_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ptm_event_id UUID NOT NULL REFERENCES ptm_events(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES students(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration INT NOT NULL DEFAULT 10,
    status slot_status_enum NOT NULL DEFAULT 'CONFIRMED',
    talking_points JSONB,
    notes TEXT,
    summary TEXT,
    summary_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_ptm_events_school ON ptm_events(school_id);
CREATE INDEX IF NOT EXISTS idx_ptm_slots_event ON ptm_slots(ptm_event_id);
CREATE INDEX IF NOT EXISTS idx_ptm_slots_teacher ON ptm_slots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ptm_slots_parent ON ptm_slots(parent_id);
CREATE INDEX IF NOT EXISTS idx_ptm_slots_student ON ptm_slots(student_id);
