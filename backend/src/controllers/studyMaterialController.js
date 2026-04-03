'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

// ─── GET /api/study-materials ─────────────────────────────────────────────────
const getStudyMaterials = async (req, res, next) => {
  try {
    const { class_subject_id, class_id } = req.query;
    const school_id = req.user.school_id;

    const conditions = ['sm.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    if (req.user.role === 'student') {
      const stuRes = await query('SELECT class_id FROM students WHERE user_id=$1', [req.user.id]);
      if (stuRes.rows.length) {
        conditions.push(`cs.class_id = $${idx++}`);
        params.push(stuRes.rows[0].class_id);
      }
    } else if (class_id) {
      conditions.push(`cs.class_id = $${idx++}`);
      params.push(class_id);
    }

    if (class_subject_id) { conditions.push(`sm.class_subject_id = $${idx++}`); params.push(class_subject_id); }

    const result = await query(
      `SELECT sm.*, s.name AS subject_name, c.name AS class_name, u.name AS uploaded_by_name
       FROM study_materials sm
       JOIN class_subjects cs ON cs.id = sm.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN classes c ON c.id = cs.class_id
       JOIN users u ON u.id = sm.uploaded_by
       WHERE ${conditions.join(' AND ')}
       ORDER BY sm.created_at DESC`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/study-materials/:id ────────────────────────────────────────────
const getStudyMaterialById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT sm.*, s.name AS subject_name, c.name AS class_name, u.name AS uploaded_by_name
       FROM study_materials sm
       JOIN class_subjects cs ON cs.id = sm.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN classes c ON c.id = cs.class_id
       JOIN users u ON u.id = sm.uploaded_by
       WHERE sm.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Study material not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── POST /api/study-materials ────────────────────────────────────────────────
const createStudyMaterial = async (req, res, next) => {
  try {
    const { class_subject_id, title, description = null, file_url, file_type = null } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO study_materials (school_id, class_subject_id, title, description, file_url, file_type, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [school_id, class_subject_id, title, description, file_url, file_type, req.user.id]
    );
    return sendSuccess(res, result.rows[0], 'Study material uploaded', 201);
  } catch (err) { next(err); }
};

// ─── DELETE /api/study-materials/:id ─────────────────────────────────────────
const deleteStudyMaterial = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM study_materials WHERE id=$1 RETURNING id, title', [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Study material not found', 404);
    return sendSuccess(res, result.rows[0], 'Study material deleted');
  } catch (err) { next(err); }
};

module.exports = { getStudyMaterials, getStudyMaterialById, createStudyMaterial, deleteStudyMaterial };
