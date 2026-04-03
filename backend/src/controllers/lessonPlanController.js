'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { generateLessonPlan: callLessonPlanAI } = require('../utils/claudeApi');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lesson-plans  — ?class_subject_id=&week_start=
// ─────────────────────────────────────────────────────────────────────────────
const getLessonPlans = async (req, res, next) => {
  try {
    const { class_subject_id, week_start } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    // Teachers see only their own lesson plans
    if (req.user.role === 'teacher') {
      conditions.push(`lp.created_by = $${idx++}`);
      params.push(req.user.id);
    }

    if (class_subject_id) { conditions.push(`lp.class_subject_id = $${idx++}`); params.push(class_subject_id); }
    if (week_start)       { conditions.push(`lp.week_start = $${idx++}`);        params.push(week_start); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT lp.id, lp.title, lp.content, lp.ai_generated, lp.week_start, lp.created_at,
              s.name AS subject_name, c.name AS class_name, c.section,
              u.name AS created_by_name
       FROM lesson_plans lp
       JOIN class_subjects cs ON cs.id = lp.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN classes c ON c.id = cs.class_id
       LEFT JOIN users u ON u.id = lp.created_by
       ${where}
       ORDER BY lp.week_start DESC, lp.created_at DESC`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lesson-plans/:id
// ─────────────────────────────────────────────────────────────────────────────
const getLessonPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT lp.*, s.name AS subject_name, c.name AS class_name, c.section,
              u.name AS created_by_name
       FROM lesson_plans lp
       JOIN class_subjects cs ON cs.id = lp.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN classes c ON c.id = cs.class_id
       LEFT JOIN users u ON u.id = lp.created_by
       WHERE lp.id = $1`, [id]
    );
    if (!result.rows.length) return sendError(res, 'Lesson plan not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lesson-plans  — manual creation
// ─────────────────────────────────────────────────────────────────────────────
const createLessonPlan = async (req, res, next) => {
  try {
    const { class_subject_id, title, content, week_start = null } = req.body;

    const result = await query(
      `INSERT INTO lesson_plans (class_subject_id, title, content, ai_generated, week_start, created_by)
       VALUES ($1,$2,$3,FALSE,$4,$5) RETURNING *`,
      [class_subject_id, title, content, week_start, req.user.id]
    );

    return sendSuccess(res, result.rows[0], 'Lesson plan created', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lesson-plans/generate  — AI-assisted draft
// ─────────────────────────────────────────────────────────────────────────────
const generateLessonPlan = async (req, res, next) => {
  try {
    const {
      class_subject_id,
      topic,
      duration_minutes = 45,
      learning_objectives = '',
      week_start = null,
    } = req.body;

    // Fetch subject and class info
    const csRes = await query(
      `SELECT s.name AS subject_name, c.name AS class_name, c.section, sc.board
       FROM class_subjects cs
       JOIN subjects s ON s.id = cs.subject_id
       JOIN classes c ON c.id = cs.class_id
       JOIN schools sc ON sc.id = c.school_id
       WHERE cs.id = $1`, [class_subject_id]
    );
    if (!csRes.rows.length) return sendError(res, 'Class subject not found', 404);
    const { subject_name, class_name, section, board } = csRes.rows[0];

    let content;
    try {
      content = await callLessonPlanAI({
        subject_name,
        class_name: `${class_name} ${section}`,
        topic,
        duration_minutes,
        learning_objectives,
        board: board || 'CBSE',
      });
    } catch (apiErr) {
      console.error('[Claude Lesson Plan Error]', apiErr.message);
      return res.status(503).json({
        success: false,
        message: 'AI lesson plan generation is temporarily unavailable. Please try again later.',
        detail: apiErr.message,
      });
    }

    const title = `${subject_name} — ${topic}`;

    const result = await query(
      `INSERT INTO lesson_plans (class_subject_id, title, content, ai_generated, week_start, created_by)
       VALUES ($1,$2,$3,TRUE,$4,$5) RETURNING *`,
      [class_subject_id, title, content, week_start, req.user.id]
    );

    return sendSuccess(res, {
      ...result.rows[0],
      subject_name,
      class_name: `${class_name} ${section}`,
    }, 'Lesson plan generated by AI', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/lesson-plans/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateLessonPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'content', 'week_start', 'class_subject_id'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);

    // Teacher can only edit their own plans
    const ownerFilter = req.user.role === 'teacher' ? `AND created_by='${req.user.id}'` : '';
    params.push(id);

    const result = await query(
      `UPDATE lesson_plans SET ${updates.join(',')} WHERE id=$${idx} ${ownerFilter} RETURNING *`,
      params
    );
    if (!result.rows.length) return sendError(res, 'Lesson plan not found or access denied', 404);
    return sendSuccess(res, result.rows[0], 'Lesson plan updated');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/lesson-plans/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteLessonPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerFilter = req.user.role === 'teacher' ? `AND created_by='${req.user.id}'` : '';

    const result = await query(
      `DELETE FROM lesson_plans WHERE id=$1 ${ownerFilter} RETURNING id`, [id]
    );
    if (!result.rows.length) return sendError(res, 'Lesson plan not found or access denied', 404);
    return sendSuccess(res, null, 'Lesson plan deleted');
  } catch (err) { next(err); }
};

module.exports = {
  getLessonPlans, getLessonPlanById,
  createLessonPlan, generateLessonPlan,
  updateLessonPlan, deleteLessonPlan,
};
