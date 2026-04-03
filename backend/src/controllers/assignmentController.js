'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { createNotificationsForMany } = require('../utils/notificationHelper');

// ── GET /api/assignments  ─────────────────────────────────────────────────────
const getAllAssignments = async (req, res, next) => {
  try {
    const { class_subject_id } = req.query;
    const { page, limit, offset } = req.pagination;
    const school_id = req.user.school_id;

    const conditions = ['cs.class_id IN (SELECT id FROM classes WHERE school_id=$1)'];
    const params = [school_id];
    let idx = 2;

    if (class_subject_id) { conditions.push(`a.class_subject_id=$${idx++}`); params.push(class_subject_id); }

    // Teachers only see their own assignments
    if (req.user.role === 'teacher') {
      conditions.push(`cs.teacher_id=$${idx++}`);
      params.push(req.user.id);
    }

    const where = conditions.join(' AND ');

    const countRes = await query(
      `SELECT COUNT(*) FROM assignments a JOIN class_subjects cs ON cs.id=a.class_subject_id WHERE ${where}`, params
    );

    const dataRes = await query(
      `SELECT a.*, cs.class_id, c.name AS class_name, c.section,
              s.name AS subject_name, u.name AS created_by_name
       FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN classes c ON c.id = cs.class_id
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN users u ON u.id = a.created_by
       WHERE ${where}
       ORDER BY a.due_date DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataRes.rows, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── GET /api/assignments/:id  ─────────────────────────────────────────────────
const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*, c.name AS class_name, c.section, s.name AS subject_name
       FROM assignments a
       JOIN class_subjects cs ON cs.id=a.class_subject_id
       JOIN classes c ON c.id=cs.class_id
       JOIN subjects s ON s.id=cs.subject_id
       WHERE a.id=$1`, [id]
    );
    if (!result.rows.length) return sendError(res, 'Assignment not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ── POST /api/assignments  ────────────────────────────────────────────────────
const createAssignment = async (req, res, next) => {
  try {
    const { class_subject_id, title, description, due_date, max_marks, attachment_url } = req.body;

    const result = await query(
      `INSERT INTO assignments (class_subject_id, title, description, due_date, max_marks, attachment_url, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [class_subject_id, title, description, due_date, max_marks || null, attachment_url || null, req.user.id]
    );
    const assignment = result.rows[0];

    // Notify students in this class_subject
    const studentsRes = await query(
      `SELECT st.user_id FROM students st
       JOIN class_subjects cs ON cs.class_id=st.class_id
       WHERE cs.id=$1`, [class_subject_id]
    );
    const userIds = studentsRes.rows.map(r => r.user_id);
    if (userIds.length) {
      await createNotificationsForMany(
        userIds, 'New Assignment',
        `A new assignment "${title}" is due on ${due_date}.`,
        'info', 'assignment', assignment.id
      );
    }

    return sendSuccess(res, assignment, 'Assignment created', 201);
  } catch (err) { next(err); }
};

// ── PUT /api/assignments/:id  ─────────────────────────────────────────────────
const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title','description','due_date','max_marks','attachment_url'];
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

// ── DELETE /api/assignments/:id  ──────────────────────────────────────────────
const deleteAssignment = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM assignments WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Assignment not found', 404);
    return sendSuccess(res, null, 'Assignment deleted');
  } catch (err) { next(err); }
};

// ── POST /api/assignments/:id/submit  ─────────────────────────────────────────
const submitAssignment = async (req, res, next) => {
  try {
    const { id: assignment_id } = req.params;
    const { content, attachment_url } = req.body;

    // Find student record
    const stuRes = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!stuRes.rows.length) return sendError(res, 'Student record not found', 404);
    const student_id = stuRes.rows[0].id;

    // Determine if late
    const asgRes = await query('SELECT due_date FROM assignments WHERE id=$1', [assignment_id]);
    if (!asgRes.rows.length) return sendError(res, 'Assignment not found', 404);
    const isLate = new Date() > new Date(asgRes.rows[0].due_date);

    const result = await query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, content, attachment_url, status)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (assignment_id, student_id) DO UPDATE
         SET content=EXCLUDED.content, attachment_url=EXCLUDED.attachment_url,
             submitted_at=NOW(), status=$5
       RETURNING *`,
      [assignment_id, student_id, content || null, attachment_url || null, isLate ? 'late' : 'submitted']
    );

    return sendSuccess(res, result.rows[0], 'Assignment submitted', 201);
  } catch (err) { next(err); }
};

// ── GET /api/assignments/:id/submissions  ─────────────────────────────────────
const getSubmissions = async (req, res, next) => {
  try {
    const { id: assignment_id } = req.params;
    const result = await query(
      `SELECT sub.*, st.roll_no, u.name AS student_name
       FROM assignment_submissions sub
       JOIN students st ON st.id=sub.student_id
       JOIN users u ON u.id=st.user_id
       WHERE sub.assignment_id=$1
       ORDER BY sub.submitted_at DESC`, [assignment_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ── PUT /api/assignments/:id/submissions/:submissionId/grade  ─────────────────
const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const result = await query(
      `UPDATE assignment_submissions
       SET score=$1, feedback=$2, status='graded', graded_by=$3, graded_at=NOW()
       WHERE id=$4 RETURNING *`,
      [score, feedback || null, req.user.id, submissionId]
    );
    if (!result.rows.length) return sendError(res, 'Submission not found', 404);
    return sendSuccess(res, result.rows[0], 'Submission graded');
  } catch (err) { next(err); }
};

module.exports = {
  getAllAssignments, getAssignmentById, createAssignment, updateAssignment,
  deleteAssignment, submitAssignment, getSubmissions, gradeSubmission,
};
