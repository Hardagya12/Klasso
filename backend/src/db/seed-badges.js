/**
 * seed-badges.js
 * 
 * Seeds default badges and initializes attendance streaks for students.
 */
require('dotenv').config();
const { pool } = require('./neon');

const BADGES = [
  { name: 'Early Bird', description: 'Achieve a 3-day attendance streak', type: 'STREAK', threshold: 3, iconName: 'SunRisingSVG', color: '#FF6B6B', rarity: 'COMMON' },
  { name: 'Consistent', description: 'Achieve a 10-day attendance streak', type: 'STREAK', threshold: 10, iconName: 'CheckmarkCircleSVG', color: '#3ECFB2', rarity: 'COMMON' },
  { name: 'On Fire', description: 'Achieve a 20-day attendance streak', type: 'STREAK', threshold: 20, iconName: 'FlameSVG', color: '#FF8C42', rarity: 'RARE' },
  { name: 'Legend', description: 'Achieve a 30-day attendance streak', type: 'STREAK', threshold: 30, iconName: 'StarCrownSVG', color: '#B5A8FF', rarity: 'EPIC' },
  { name: 'Unstoppable', description: 'Achieve a 50-day attendance streak', type: 'STREAK', threshold: 50, iconName: 'RocketSVG', color: '#FFD700', rarity: 'LEGENDARY' },
  { name: 'Comeback Kid', description: 'Present 5 days after 3+ absences', type: 'SPECIAL', threshold: 5, iconName: 'PhoenixSVG', color: '#FF6B6B', rarity: 'RARE' },
  { name: 'Perfect Month', description: '100% attendance in a calendar month', type: 'PERFORMANCE', threshold: 1, iconName: 'CalendarStarSVG', color: '#3ECFB2', rarity: 'EPIC' },
  { name: 'First Step', description: 'First ever present day', type: 'SPECIAL', threshold: 1, iconName: 'FootprintSVG', color: '#FFD700', rarity: 'COMMON' }
];

const seedBadgesAndStreaks = async () => {
  console.log('🏅 Starting badges and streaks seeding...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert or update badges
    for (const b of BADGES) {
      await client.query(`
        INSERT INTO badges (name, description, type, threshold, icon_name, color, rarity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [b.name, b.description, b.type, b.threshold, b.iconName, b.color, b.rarity]);
      console.log(`  Added badge: ${b.name}`);
    }

    // Initialize streaks for all students who don't have one
    const studentRes = await client.query('SELECT id FROM students');
    let streakCount = 0;
    for (const row of studentRes.rows) {
      const res = await client.query(`
        INSERT INTO attendance_streaks (student_id, updated_at)
        VALUES ($1, NOW())
        ON CONFLICT (student_id) DO NOTHING
        RETURNING id
      `, [row.id]);
      if (res.rowCount > 0) streakCount++;
    }
    console.log(`  Initialized ${streakCount} new streak records`);

    await client.query('COMMIT');
    console.log('✅ Badges and streaks seeding completed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed', err);
  } finally {
    client.release();
    pool.end();
  }
};

seedBadgesAndStreaks();
