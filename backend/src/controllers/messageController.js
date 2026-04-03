'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ─── GET /api/messages/inbox ─────────────────────────────────────────────────
const getInbox = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const user_id = req.user.id;

    const totalRes = await query(
      'SELECT COUNT(*) FROM messages WHERE recipient_id=$1 AND deleted_by_recipient=false',
      [user_id]
    );
    const total = parseInt(totalRes.rows[0].count, 10);

    const result = await query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.recipient_id=$1 AND m.deleted_by_recipient=false
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    return sendPaginated(res, result.rows, total, { page, limit, offset });
  } catch (err) { next(err); }
};

// ─── GET /api/messages/sent ──────────────────────────────────────────────────
const getSent = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const user_id = req.user.id;

    const totalRes = await query(
      'SELECT COUNT(*) FROM messages WHERE sender_id=$1 AND deleted_by_sender=false',
      [user_id]
    );
    const total = parseInt(totalRes.rows[0].count, 10);

    const result = await query(
      `SELECT m.*, u.name AS recipient_name, u.role AS recipient_role
       FROM messages m
       JOIN users u ON u.id = m.recipient_id
       WHERE m.sender_id=$1 AND m.deleted_by_sender=false
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    return sendPaginated(res, result.rows, total, { page, limit, offset });
  } catch (err) { next(err); }
};

// ─── GET /api/messages/contacts ──────────────────────────────────────────────
const getContacts = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      `SELECT id, name, role, email FROM users
       WHERE school_id=$1 AND id != $2 AND is_active=true
       ORDER BY name`,
      [school_id, req.user.id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/messages/:id ───────────────────────────────────────────────────
const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT m.*, 
              s.name AS sender_name, s.role AS sender_role,
              r.name AS recipient_name, r.role AS recipient_role
       FROM messages m
       JOIN users s ON s.id = m.sender_id
       JOIN users r ON r.id = m.recipient_id
       WHERE m.id=$1 AND (m.sender_id=$2 OR m.recipient_id=$2)`,
      [id, req.user.id]
    );
    if (!result.rows.length) return sendError(res, 'Message not found', 404);

    // Auto-mark as read if recipient
    if (result.rows[0].recipient_id === req.user.id && !result.rows[0].is_read) {
      await query('UPDATE messages SET is_read=true, read_at=NOW() WHERE id=$1', [id]);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── POST /api/messages ──────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { recipient_id, body, subject = null } = req.body;
    const result = await query(
      `INSERT INTO messages (sender_id, recipient_id, subject, body)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, recipient_id, subject, body]
    );
    return sendSuccess(res, result.rows[0], 'Message sent', 201);
  } catch (err) { next(err); }
};

// ─── PUT /api/messages/:id/read ──────────────────────────────────────────────
const markRead = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE messages SET is_read=true, read_at=NOW()
       WHERE id=$1 AND recipient_id=$2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return sendError(res, 'Message not found', 404);
    return sendSuccess(res, result.rows[0], 'Marked as read');
  } catch (err) { next(err); }
};

// ─── DELETE /api/messages/:id ────────────────────────────────────────────────
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Soft-delete: flag which side deleted
    const msgRes = await query('SELECT sender_id, recipient_id FROM messages WHERE id=$1', [id]);
    if (!msgRes.rows.length) return sendError(res, 'Message not found', 404);
    const msg = msgRes.rows[0];

    if (msg.sender_id === user_id) {
      await query('UPDATE messages SET deleted_by_sender=true WHERE id=$1', [id]);
    } else if (msg.recipient_id === user_id) {
      await query('UPDATE messages SET deleted_by_recipient=true WHERE id=$1', [id]);
    } else {
      return sendError(res, 'Forbidden', 403);
    }

    return sendSuccess(res, null, 'Message deleted');
  } catch (err) { next(err); }
};

module.exports = { getInbox, getSent, getMessageById, sendMessage, markRead, deleteMessage, getContacts };
