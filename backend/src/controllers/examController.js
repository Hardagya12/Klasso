'use strict';

const { pool, query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotificationsForMany } = require('../utils/notificationHelper');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/exams  — ?class_id=&exam_type=
// ─────────────────────────────────────────────────────────────────────────────
const getExams = async (req, res, next) => {
  try {
    const { class_id, exam_type } = req.query;
    const school_id = req.user.school_id;

    const conditions = ['e.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    // Students can only see their own class exams
    if (req.user.role === 'student') {
      const stuRes = await query('SELECT class_id FROM students WHERE user_id=$1', [req.user.id]);
      if (stuRes.rows.length) {
        conditions.push(`e.class_id = $${idx++}`);
        params.push(stuRes.rows[0].class_id);
      }
    } else if (class_id) {
      conditions.push(`e.class_id = $${idx++}`);
      params.push(class_id);
    }

    if (exam_type) { conditions.push(`e.exam_type = $${idx++}`); params.push(exam_type); }

    const result = await query(
      `SELECT e.*,
              c.name AS class_name, c.section,
              u.name AS created_by_name,
              COUNT(DISTINCT es.id)::int AS subject_count,
              MIN(es.exam_date) AS first_exam_date,
              MAX(es.exam_date) AS last_exam_date
       FROM exams e
       LEFT JOIN classes c ON c.id = e.class_id
       LEFT JOIN users u ON u.id = e.created_by
       LEFT JOIN exam_subjects es ON es.exam_id = e.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY e.id, c.name, c.section, u.name
       ORDER BY e.start_date DESC`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/exams/:id
// ─────────────────────────────────────────────────────────────────────────────
const getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const examRes = await query(
      `SELECT e.*, c.name AS class_name, c.section
       FROM exams e
       LEFT JOIN classes c ON c.id = e.class_id
       WHERE e.id = $1`,
      [id]
    );
    if (!examRes.rows.length) return sendError(res, 'Exam not found', 404);
    const exam = examRes.rows[0];

    // Exam subjects with marks entry status
    const esRes = await query(
      `SELECT es.*,
              s.name AS subject_name, s.code AS subject_code,
              COUNT(m.id)::int AS marks_entered,
              (SELECT COUNT(*) FROM students WHERE class_id = e.class_id)::int AS total_students
       FROM exam_subjects es
       JOIN subjects s ON s.id = es.subject_id
       JOIN exams e ON e.id = es.exam_id
       LEFT JOIN marks m ON m.exam_subject_id = es.id
       WHERE es.exam_id = $1
       GROUP BY es.id, s.name, s.code, e.class_id
       ORDER BY es.exam_date`,
      [id]
    );

    exam.subjects = esRes.rows;
    return sendSuccess(res, exam);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/exams
// ─────────────────────────────────────────────────────────────────────────────
const createExam = async (req, res, next) => {
  try {
    const { name, class_id, exam_type = 'unit_test', start_date = null, end_date = null } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [school_id, class_id, name, exam_type, start_date, end_date, req.user.id]
    );
    const exam = result.rows[0];

    // Notify students + their parents
    const targetRes = await query(
      `SELECT st.user_id,
              (SELECT array_agg(sp.parent_id) FROM student_parents sp WHERE sp.student_id = st.id) AS parent_ids
       FROM students st WHERE st.class_id = $1`,
      [class_id]
    );

    const allUserIds = [];
    for (const row of targetRes.rows) {
      if (row.user_id)    allUserIds.push(row.user_id);
      if (row.parent_ids) allUserIds.push(...row.parent_ids);
    }
    const uniqueIds = [...new Set(allUserIds)];
    if (uniqueIds.length) {
      await createNotificationsForMany(
        uniqueIds,
        'New Exam Scheduled',
        `${name} (${exam_type}) has been scheduled. Check timetable for details.`,
        'info', 'exam', exam.id
      );
    }

    return sendSuccess(res, exam, 'Exam created successfully', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/exams/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'exam_type', 'start_date', 'end_date', 'class_id'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE exams SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Exam not found', 404);
    return sendSuccess(res, result.rows[0], 'Exam updated');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/exams/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteExam = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM exams WHERE id=$1 RETURNING id, name', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Exam not found', 404);
    return sendSuccess(res, result.rows[0], 'Exam deleted');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/exams/:id/subjects
// ─────────────────────────────────────────────────────────────────────────────
const addSubjectToExam = async (req, res, next) => {
  try {
    const { id: exam_id } = req.params;
    const { subject_id, max_marks = 100, passing_marks = 33, exam_date = null } = req.body;

    await query(
      `INSERT INTO exam_subjects (exam_id, subject_id, max_marks, passing_marks, exam_date)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (exam_id, subject_id) DO UPDATE
         SET max_marks=EXCLUDED.max_marks,
             passing_marks=EXCLUDED.passing_marks,
             exam_date=EXCLUDED.exam_date`,
      [exam_id, subject_id, max_marks, passing_marks, exam_date]
    );

    // Return updated exam_subjects list
    const list = await query(
      `SELECT es.*, s.name AS subject_name, s.code AS subject_code
       FROM exam_subjects es
       JOIN subjects s ON s.id = es.subject_id
       WHERE es.exam_id = $1
       ORDER BY es.exam_date NULLS LAST, s.name`,
      [exam_id]
    );

    return sendSuccess(res, list.rows, 'Subject added to exam', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/exams/:examId/subjects/:subjectId
// ─────────────────────────────────────────────────────────────────────────────
const removeSubjectFromExam = async (req, res, next) => {
  try {
    const { examId, subjectId } = req.params;
    const result = await query(
      `DELETE FROM exam_subjects WHERE exam_id=$1 AND subject_id=$2 RETURNING *`,
      [examId, subjectId]
    );
    if (!result.rows.length) return sendError(res, 'Subject not found in exam', 404);
    return sendSuccess(res, null, 'Subject removed from exam');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/exams/:id/schedule  — exam countdown view for students
// ─────────────────────────────────────────────────────────────────────────────
const getExamSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const examRes = await query('SELECT name, exam_type, start_date, end_date FROM exams WHERE id=$1', [id]);
    if (!examRes.rows.length) return sendError(res, 'Exam not found', 404);

    const schedule = await query(
      `SELECT s.name AS subject_name, s.code AS subject_code,
              es.exam_date, es.max_marks, es.passing_marks
       FROM exam_subjects es
       JOIN subjects s ON s.id = es.subject_id
       WHERE es.exam_id = $1
       ORDER BY es.exam_date NULLS LAST, s.name`,
      [id]
    );

    return sendSuccess(res, {
      exam: examRes.rows[0],
      schedule: schedule.rows,
    });
  } catch (err) { next(err); }
};

module.exports = {
  getExams, getExamById, createExam, updateExam, deleteExam,
  addSubjectToExam, removeSubjectFromExam, getExamSchedule,
};
