-- Migration: Attendance Streaks and Badges Gamification

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "BadgeType" AS ENUM ('STREAK', 'PERFORMANCE', 'SUBMISSION', 'SPECIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS "attendance_streaks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_present_date" DATE,
    "total_present_days" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_streaks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "attendance_streaks_student_id_key" ON "attendance_streaks"("student_id");

CREATE TABLE IF NOT EXISTS "badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL DEFAULT 'STREAK',
    "threshold" INTEGER NOT NULL DEFAULT 0,
    "icon_name" VARCHAR(60) NOT NULL,
    "color" VARCHAR(10) NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "student_badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "earned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_new" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "student_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_badges_student_id_badge_id_key" ON "student_badges"("student_id", "badge_id");
CREATE INDEX IF NOT EXISTS "idx_student_badges_student" ON "student_badges"("student_id");

-- 3. Foreign Keys
DO $$ BEGIN
    ALTER TABLE "attendance_streaks" ADD CONSTRAINT "attendance_streaks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
