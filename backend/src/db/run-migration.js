const fs = require('fs');
const path = require('path');
const { pool } = require('./neon');

const runMigration = async () => {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrate_streaks_badges.sql'), 'utf-8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Migration executed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed', err);
  } finally {
    client.release();
    pool.end();
  }
};

runMigration();
