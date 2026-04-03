'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

// ─── GET /api/announcements ──────────────────────────────────────────────────
const getAnnouncements = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      `SELECT a.*, u.name AS author_name
       FROM announcements a
       JOIN users u ON u.id = a.created_by
       WHERE a.school_id = $1
       ORDER BY a.created_at DESC`,
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/announcements/:id ─────────────────────────────────────────────
const getAnnouncementById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT a.*, u.name AS author_name
       FROM announcements a
       JOIN users u ON u.id = a.created_by
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Announcement not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── POST /api/announcements ─────────────────────────────────────────────────
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, audience = 'all' } = req.body;
    const school_id = req.user.school_id;
    const result = await query(
      `INSERT INTO announcements (school_id, title, body, audience, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [school_id, title, body, audience, req.user.id]
    );
    return sendSuccess(res, result.rows[0], 'Announcement created', 201);
  } catch (err) { next(err); }
};

// ─── PUT /api/announcements/:id ──────────────────────────────────────────────
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'body', 'audience'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE announcements SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Announcement not found', 404);
    return sendSuccess(res, result.rows[0], 'Announcement updated');
  } catch (err) { next(err); }
};

// ─── DELETE /api/announcements/:id ──────────────────────────────────────────
const deleteAnnouncement = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM announcements WHERE id=$1 RETURNING id, title', [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Announcement not found', 404);
    return sendSuccess(res, result.rows[0], 'Announcement deleted');
  } catch (err) { next(err); }
};

module.exports = { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement };
