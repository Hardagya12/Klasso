require('dotenv').config();
const fs = require('fs');
const { query, pool } = require('./src/db/neon');
const sql = fs.readFileSync('./src/db/migrations/005_ptm.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Migrated PTM successfully!');
    pool.end();
  })
  .catch(e => {
    console.error('Migration error:', e.message);
    pool.end();
  });
