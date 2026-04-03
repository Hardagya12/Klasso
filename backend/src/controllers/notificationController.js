'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ─── GET /api/notifications ───────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const user_id = req.user.id;

    const totalRes = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id=$1', [user_id]
    );
    const total = parseInt(totalRes.rows[0].count, 10);

    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    return sendPaginated(res, result.rows, total, { page, limit, offset });
  } catch (err) { next(err); }
};

// ─── GET /api/notifications/count ────────────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id=$1 AND is_read=false',
      [req.user.id]
    );
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
const markOneRead = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE notifications SET is_read=true, read_at=NOW()
       WHERE id=$1 AND user_id=$2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, result.rows[0], 'Marked as read');
  } catch (err) { next(err); }
};

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE notifications SET is_read=true, read_at=NOW()
       WHERE user_id=$1 AND is_read=false`,
      [req.user.id]
    );
    return sendSuccess(res, { updated: result.rowCount }, 'All notifications marked as read');
  } catch (err) { next(err); }
};

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM notifications WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, null, 'Notification deleted');
  } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markOneRead, markAllRead, deleteNotification };
