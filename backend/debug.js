require('dotenv').config();
const { query } = require('./src/db/neon');
async function check() {
  const res = await query('SELECT * FROM users WHERE email = $1', ['teacher1@school.com']);
  console.log('User status:', res.rows[0]);
}
check();
