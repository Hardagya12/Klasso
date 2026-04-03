'use strict';

/**
 * setup.js — Creates all tables from schema.sql, then runs the seeder.
 * Usage: node src/db/setup.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./neon');

async function setup() {
  const client = await pool.connect();

  try {
    // 1 — Apply schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    console.log('📦  Applying schema.sql …');
    await client.query(schemaSql);
    console.log('✅  Schema applied successfully.\n');
  } catch (err) {
    console.error('❌  Schema application failed:', err.message);
    throw err;
  } finally {
    client.release();
  }

  // 2 — Run seeder (it manages its own connection)
  console.log('🌱  Running seed.js …');
  require('./seed');
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
