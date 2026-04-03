'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

// ─── GET /api/events ─────────────────────────────────────────────────────────
const getEvents = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      `SELECT e.*, u.name AS created_by_name
       FROM events e
       JOIN users u ON u.id = e.created_by
       WHERE e.school_id = $1
       ORDER BY e.start_date`,
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/events/:id ─────────────────────────────────────────────────────
const getEventById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, u.name AS created_by_name
       FROM events e
       JOIN users u ON u.id = e.created_by
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Event not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── POST /api/events ────────────────────────────────────────────────────────
const createEvent = async (req, res, next) => {
  try {
    const { title, description = null, start_date, end_date = null, location = null, event_type = 'general' } = req.body;
    const school_id = req.user.school_id;
    const result = await query(
      `INSERT INTO events (school_id, title, description, start_date, end_date, location, event_type, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [school_id, title, description, start_date, end_date, location, event_type, req.user.id]
    );
    return sendSuccess(res, result.rows[0], 'Event created', 201);
  } catch (err) { next(err); }
};

// ─── PUT /api/events/:id ─────────────────────────────────────────────────────
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'description', 'start_date', 'end_date', 'location', 'event_type'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE events SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Event not found', 404);
    return sendSuccess(res, result.rows[0], 'Event updated');
  } catch (err) { next(err); }
};

// ─── DELETE /api/events/:id ──────────────────────────────────────────────────
const deleteEvent = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM events WHERE id=$1 RETURNING id, title', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Event not found', 404);
    return sendSuccess(res, result.rows[0], 'Event deleted');
  } catch (err) { next(err); }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
