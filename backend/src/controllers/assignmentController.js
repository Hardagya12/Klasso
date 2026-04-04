'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { createNotificationsForMany } = require('../utils/notificationHelper');
const questService = require('../utils/questService');

// ─── GET /api/assignments ────────────────────────────────────────────────────
const getAssignments = async (req, res, next) => {
  try {
    const { class_subject_id, class_id } = req.query;
    const school_id = req.user.school_id;
    const { page, limit, offset } = req.pagination;

    // assignments table has no school_id — scope via class_subjects → classes
    const conditions = ['c.school_id = $1'];
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

    if (class_subject_id) { conditions.push(`a.class_subject_id = $${idx++}`); params.push(class_subject_id); }

    const whereClause = conditions.join(' AND ');

    const totalRes = await query(
      `SELECT COUNT(*) FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN classes c ON c.id = cs.class_id
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(totalRes.rows[0].count, 10);

    const result = await query(
      `SELECT a.*, cs.class_id, c.name AS class_name, s.name AS subject_name, u.name AS teacher_name,
              COUNT(sub.id)::int AS submission_count
       FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN classes c ON c.id = cs.class_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN users u ON u.id = a.created_by
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id
       WHERE ${whereClause}
       GROUP BY a.id, cs.class_id, c.name, s.name, u.name
       ORDER BY a.due_date DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, result.rows, total, { page, limit, offset });
  } catch (err) { next(err); }
};

// ─── GET /api/assignments/:id ────────────────────────────────────────────────
const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*, cs.class_id, c.name AS class_name, s.name AS subject_name, u.name AS teacher_name
       FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN classes c ON c.id = cs.class_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN users u ON u.id = a.created_by
       WHERE a.id = $1`,
      [id]
    );
    if (!result.rows.length) return sendError(res, 'Assignment not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── POST /api/assignments ───────────────────────────────────────────────────
const createAssignment = async (req, res, next) => {
  try {
    const { class_subject_id, title, description = null, due_date, max_marks = 100 } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO assignments (school_id, class_subject_id, title, description, due_date, max_marks, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [school_id, class_subject_id, title, description, due_date, max_marks, req.user.id]
    );
    const assignment = result.rows[0];

    // Notify students in the class
    const csRes = await query('SELECT class_id FROM class_subjects WHERE id=$1', [class_subject_id]);
    if (csRes.rows.length) {
      const stuRes = await query(
        `SELECT st.user_id FROM students st WHERE st.class_id = $1`,
        [csRes.rows[0].class_id]
      );
      const userIds = stuRes.rows.map(r => r.user_id).filter(Boolean);
      if (userIds.length) {
        await createNotificationsForMany(
          userIds, 'New Assignment', `"${title}" is due on ${due_date}.`,
          'info', 'assignment', assignment.id
        );
      }
    }

    return sendSuccess(res, assignment, 'Assignment created', 201);
  } catch (err) { next(err); }
};

// ─── PUT /api/assignments/:id ────────────────────────────────────────────────
const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'description', 'due_date', 'max_marks'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE assignments SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Assignment not found', 404);
    return sendSuccess(res, result.rows[0], 'Assignment updated');
  } catch (err) { next(err); }
};

// ─── DELETE /api/assignments/:id ─────────────────────────────────────────────
const deleteAssignment = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM assignments WHERE id=$1 RETURNING id, title', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Assignment not found', 404);
    return sendSuccess(res, result.rows[0], 'Assignment deleted');
  } catch (err) { next(err); }
};

// ─── POST /api/assignments/:id/submit ───────────────────────────────────────
const submitAssignment = async (req, res, next) => {
  try {
    const { id: assignment_id } = req.params;
    const { attachment_url = null, content = null } = req.body;

    // Get student id
    const stuRes = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!stuRes.rows.length) return sendError(res, 'Student record not found', 404);
    const student_id = stuRes.rows[0].id;

    const result = await query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, attachment_url, content)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (assignment_id, student_id) DO UPDATE
         SET attachment_url=EXCLUDED.attachment_url, content=EXCLUDED.content, submitted_at=NOW()
       RETURNING *`,
      [assignment_id, student_id, attachment_url, content]
    );

    // Check quest completions (submission trigger)
    questService.checkQuestCompletions(student_id, 'submission').catch(e =>
      console.error('[questService] submission trigger error:', e.message)
    );

    return sendSuccess(res, result.rows[0], 'Assignment submitted', 201);
  } catch (err) { next(err); }
};

// ─── GET /api/assignments/:id/submissions ────────────────────────────────────
const getSubmissions = async (req, res, next) => {
  try {
    const { id: assignment_id } = req.params;
    const result = await query(
      `SELECT sub.*, u.name AS student_name, st.roll_no
       FROM assignment_submissions sub
       JOIN students st ON st.id = sub.student_id
       JOIN users u ON u.id = st.user_id
       WHERE sub.assignment_id = $1
       ORDER BY sub.submitted_at`,
      [assignment_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── PUT /api/assignments/submissions/:id/grade ──────────────────────────────
const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, feedback = null } = req.body;
    const result = await query(
      `UPDATE assignment_submissions
       SET score=$1, feedback=$2, graded_by=$3, graded_at=NOW()
       WHERE id=$4 RETURNING *`,
      [score, feedback, req.user.id, id]
    );
    if (!result.rows.length) return sendError(res, 'Submission not found', 404);
    return sendSuccess(res, result.rows[0], 'Submission graded');
  } catch (err) { next(err); }
};

// ─── GET /api/assignments/my/pending ───────────────────────────────────────
const getMyPendingAssignments = async (req, res, next) => {
  try {
    const stuRes = await query('SELECT id, class_id FROM students WHERE user_id=$1', [req.user.id]);
    if (!stuRes.rows.length) return sendSuccess(res, []);
    const { id: student_id, class_id } = stuRes.rows[0];

    const result = await query(
      `SELECT a.*, s.name AS subject_name
       FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $1
       WHERE cs.class_id = $2
         AND sub.id IS NULL
         AND a.due_date >= NOW()
       ORDER BY a.due_date`,
      [student_id, class_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/assignments/my/submitted ─────────────────────────────────────
const getMySubmittedAssignments = async (req, res, next) => {
  try {
    const stuRes = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!stuRes.rows.length) return sendSuccess(res, []);
    const student_id = stuRes.rows[0].id;

    const result = await query(
      `SELECT a.title, a.due_date, a.max_marks, s.name AS subject_name,
              sub.submitted_at, sub.score, sub.feedback
       FROM assignment_submissions sub
       JOIN assignments a ON a.id = sub.assignment_id
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       WHERE sub.student_id = $1
       ORDER BY sub.submitted_at DESC`,
      [student_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

module.exports = {
  getAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment,
  submitAssignment, getSubmissions, gradeSubmission,
  getMyPendingAssignments, getMySubmittedAssignments,
};
