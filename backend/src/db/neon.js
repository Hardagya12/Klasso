              const { Pool } = require('@neondatabase/serverless');
const WebSocket = require('ws');

global.WebSocket = WebSocket;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  websocketConstructor: WebSocket,
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query`, { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error(`Query Error`, { text, error });
    throw error;
  }
};

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('PostgreSQL (Neon) connected successfully at', res.rows[0].now);
  } catch (error) {
    console.error('Connection error', error.stack);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
