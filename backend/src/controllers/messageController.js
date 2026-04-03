'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── GET /api/messages  ────────────────────────────────────────────────────────
// Returns inbox for logged-in user
const getInbox = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const { unread } = req.query;

    const conditions = ['m.recipient_id = $1'];
    const params = [req.user.id];
    let idx = 2;
    if (unread === 'true') { conditions.push(`m.read = FALSE`); }

    const where = conditions.join(' AND ');
    const countRes = await query(`SELECT COUNT(*) FROM messages m WHERE ${where}`, params);

    const dataRes = await query(
      `SELECT m.id, m.subject, m.body, m.read, m.read_at, m.created_at,
              u.id AS sender_id, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE ${where}
       ORDER BY m.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataRes.rows, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── GET /api/messages/sent  ───────────────────────────────────────────────────
const getSent = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;

    const countRes = await query('SELECT COUNT(*) FROM messages WHERE sender_id=$1', [req.user.id]);
    const dataRes  = await query(
      `SELECT m.id, m.subject, m.body, m.read, m.created_at,
              u.id AS recipient_id, u.name AS recipient_name
       FROM messages m
       JOIN users u ON u.id = m.recipient_id
       WHERE m.sender_id=$1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return sendPaginated(res, dataRes.rows, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── GET /api/messages/:id  ────────────────────────────────────────────────────
const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT m.*, sender.name AS sender_name, rcpt.name AS recipient_name
       FROM messages m
       JOIN users sender ON sender.id = m.sender_id
       JOIN users rcpt ON rcpt.id = m.recipient_id
       WHERE m.id=$1 AND (m.sender_id=$2 OR m.recipient_id=$2)`,
      [id, req.user.id]
    );
    if (!result.rows.length) return sendError(res, 'Message not found', 404);

    // Mark as read if recipient
    if (result.rows[0].recipient_id === req.user.id && !result.rows[0].read) {
      await query('UPDATE messages SET read=TRUE, read_at=NOW() WHERE id=$1', [id]);
      result.rows[0].read = true;
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ── POST /api/messages  ───────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { recipient_id, subject, body } = req.body;

    const result = await query(
      `INSERT INTO messages (sender_id, recipient_id, subject, body)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, recipient_id, subject || null, body]
    );

    return sendSuccess(res, result.rows[0], 'Message sent', 201);
  } catch (err) { next(err); }
};

// ── DELETE /api/messages/:id  ─────────────────────────────────────────────────
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM messages WHERE id=$1 AND (sender_id=$2 OR recipient_id=$2) RETURNING id',
      [id, req.user.id]
    );
    if (!result.rows.length) return sendError(res, 'Message not found', 404);
    return sendSuccess(res, null, 'Message deleted');
  } catch (err) { next(err); }
};

// ── PATCH /api/messages/:id/read  ────────────────────────────────────────────
const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(
      'UPDATE messages SET read=TRUE, read_at=NOW() WHERE id=$1 AND recipient_id=$2',
      [id, req.user.id]
    );
    return sendSuccess(res, null, 'Marked as read');
  } catch (err) { next(err); }
};

module.exports = { getInbox, getSent, getMessageById, sendMessage, deleteMessage, markRead };
