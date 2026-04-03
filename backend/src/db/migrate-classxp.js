'use strict';
require('dotenv').config();
const { query } = require('./neon');

async function migrateClassXP() {
  console.log('🔄 Starting Class XP migration...');

  try {
    // 1. Create Enum
    console.log('📝 Creating XPEventType enum...');
    await query(`
      DO $$ BEGIN
        CREATE TYPE "XPEventType" AS ENUM (
          'FULL_ATTENDANCE_DAY',
          'HIGH_ATTENDANCE_DAY',
          'ALL_HOMEWORK_SUBMITTED',
          'HIGH_SUBMISSION_RATE',
          'CLASS_TEST_AVG_ABOVE_80',
          'CLASS_TEST_AVG_ABOVE_70',
          'ZERO_LATE_SUBMISSIONS',
          'LEVEL_UP_BONUS',
          'TEACHER_BONUS',
          'STREAK_MILESTONE'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create class_xp table
    console.log('📝 Creating class_xp table...');
    await query(`
      CREATE TABLE IF NOT EXISTS class_xp (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL UNIQUE REFERENCES classes(id) ON DELETE CASCADE,
        total_xp INT NOT NULL DEFAULT 0,
        current_level INT NOT NULL DEFAULT 1,
        current_title VARCHAR(50) NOT NULL DEFAULT 'Seedlings',
        xp_to_next_level INT NOT NULL DEFAULT 500,
        weekly_xp INT NOT NULL DEFAULT 0,
        week_start_date DATE NOT NULL
      );
    `);

    // 3. Create xp_events table
    console.log('📝 Creating xp_events table...');
    await query(`
      CREATE TABLE IF NOT EXISTS xp_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_xp_id UUID NOT NULL REFERENCES class_xp(id) ON DELETE CASCADE,
        type "XPEventType" NOT NULL,
        xp_earned INT NOT NULL,
        description TEXT NOT NULL,
        triggered_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Create indexes
    console.log('📝 Creating indexes...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_xp_events_class_xp ON xp_events(class_xp_id);
    `);

    // 5. Seed existing classes into class_xp
    console.log('🌱 Seeding existing classes to Level 1...');
    const curDate = new Date();
    // Monday of current week
    const day = curDate.getDay() || 7; // Get current day number, converting Sun. to 7
    if (day !== 1) curDate.setHours(-24 * (day - 1));
    const weekStartStr = curDate.toISOString().split('T')[0];

    const result = await query(`
      INSERT INTO class_xp (class_id, week_start_date)
      SELECT id, $1 FROM classes
      ON CONFLICT (class_id) DO NOTHING
      RETURNING id;
    `, [weekStartStr]);

    console.log(`✅ Seeded ${result.rowCount} classes with default Level 1 XP.`);

    console.log('🎉 Class XP migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateClassXP();
