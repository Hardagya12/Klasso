'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

// ── GET /api/subjects ──────────────────────────────────────────────────────────
const getAllSubjects = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;

    const result = await query(
      `SELECT s.id, s.name, s.code, s.created_at,
              COUNT(cs.id)::int AS classes_count
       FROM subjects s
       LEFT JOIN class_subjects cs ON cs.subject_id = s.id
       WHERE s.school_id = $1
       GROUP BY s.id
       ORDER BY s.name`,
      [school_id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/subjects ─────────────────────────────────────────────────────────
const createSubject = async (req, res, next) => {
  try {
    const { name, code = null } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO subjects (school_id, name, code)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [school_id, name, code]
    );

    return sendSuccess(res, result.rows[0], 'Subject created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/subjects/:id ──────────────────────────────────────────────────────
const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;
    const { name, code } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx++}`); params.push(name); }
    if (code !== undefined) { updates.push(`code = $${idx++}`); params.push(code); }

    if (updates.length === 0) return sendError(res, 'No fields to update', 400);

    params.push(id, school_id);
    const result = await query(
      `UPDATE subjects SET ${updates.join(', ')}
       WHERE id = $${idx++} AND school_id = $${idx}
       RETURNING *`,
      params
    );

    if (!result.rows.length) return sendError(res, 'Subject not found', 404);

    return sendSuccess(res, result.rows[0], 'Subject updated successfully');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/subjects/:id ───────────────────────────────────────────────────
const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const result = await query(
      `DELETE FROM subjects WHERE id = $1 AND school_id = $2 RETURNING id, name`,
      [id, school_id]
    );

    if (!result.rows.length) return sendError(res, 'Subject not found', 404);

    return sendSuccess(res, result.rows[0], 'Subject deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSubjects, createSubject, updateSubject, deleteSubject };
