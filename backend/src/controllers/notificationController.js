'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendPaginated } = require('../utils/response');

// ── GET /api/notifications  ───────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const { unread } = req.query;

    const conditions = ['user_id = $1'];
    const params = [req.user.id];

    if (unread === 'true') conditions.push('read = FALSE');

    const where = conditions.join(' AND ');
    const countRes = await query(`SELECT COUNT(*) FROM notifications WHERE ${where}`, params);
    const dataRes  = await query(
      `SELECT * FROM notifications WHERE ${where}
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataRes.rows, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/:id/read  ───────────────────────────────────────
const markOneRead = async (req, res, next) => {
  try {
    await query(
      'UPDATE notifications SET read=TRUE WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    return sendSuccess(res, null, 'Notification marked as read');
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/read-all  ───────────────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    await query('UPDATE notifications SET read=TRUE WHERE user_id=$1 AND read=FALSE', [req.user.id]);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
};

// ── DELETE /api/notifications/:id  ────────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    await query('DELETE FROM notifications WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    return sendSuccess(res, null, 'Notification deleted');
  } catch (err) { next(err); }
};

// ── GET /api/notifications/unread-count  ─────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND read=FALSE', [req.user.id]
    );
    return sendSuccess(res, { count: parseInt(result.rows[0].count) });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markOneRead, markAllRead, deleteNotification, getUnreadCount };
