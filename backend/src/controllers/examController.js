'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { getGradeLetter, getGradePoint, computeCGPA, computeClassRanks, isPassing } = require('../utils/gradeCalculator');
const { createNotification } = require('../utils/notificationHelper');

// ── GET /api/exams  ───────────────────────────────────────────────────────────
const getAllExams = async (req, res, next) => {
  try {
    const { class_id } = req.query;
    const school_id = req.user.school_id;

    const conditions = ['e.school_id = $1'];
    const params = [school_id];
    let idx = 2;
    if (class_id) { conditions.push(`e.class_id = $${idx++}`); params.push(class_id); }

    const result = await query(
      `SELECT e.*, c.name AS class_name, c.section,
              u.name AS created_by_name
       FROM exams e
       LEFT JOIN classes c ON c.id = e.class_id
       LEFT JOIN users u ON u.id = e.created_by
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.start_date DESC`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ── GET /api/exams/:id  ───────────────────────────────────────────────────────
const getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const examRes = await query(
      `SELECT e.*, c.name AS class_name, c.section FROM exams e
       LEFT JOIN classes c ON c.id = e.class_id WHERE e.id=$1`, [id]
    );
    if (!examRes.rows.length) return sendError(res, 'Exam not found', 404);
    const exam = examRes.rows[0];

    const subjects = await query(
      `SELECT es.*, s.name AS subject_name, s.code FROM exam_subjects es
       JOIN subjects s ON s.id = es.subject_id WHERE es.exam_id=$1`, [id]
    );
    exam.subjects = subjects.rows;

    return sendSuccess(res, exam);
  } catch (err) { next(err); }
};

// ── POST /api/exams  ──────────────────────────────────────────────────────────
const createExam = async (req, res, next) => {
  try {
    const { class_id, name, exam_type = 'unit_test', start_date, end_date, subjects = [] } = req.body;
    const school_id = req.user.school_id;

    const examRes = await query(
      `INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [school_id, class_id, name, exam_type, start_date, end_date, req.user.id]
    );
    const exam = examRes.rows[0];

    for (const s of subjects) {
      await query(
        `INSERT INTO exam_subjects (exam_id, subject_id, max_marks, passing_marks, exam_date)
         VALUES ($1,$2,$3,$4,$5)`,
        [exam.id, s.subject_id, s.max_marks ?? 100, s.passing_marks ?? 33, s.exam_date ?? null]
      );
    }

    return sendSuccess(res, exam, 'Exam created successfully', 201);
  } catch (err) { next(err); }
};

// ── PUT /api/exams/:id  ───────────────────────────────────────────────────────
const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['name','exam_type','start_date','end_date','class_id'];
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

// ── DELETE /api/exams/:id  ────────────────────────────────────────────────────
const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM exams WHERE id=$1 RETURNING id', [id]);
    if (!result.rows.length) return sendError(res, 'Exam not found', 404);
    return sendSuccess(res, null, 'Exam deleted');
  } catch (err) { next(err); }
};

// ── POST /api/exams/:id/marks  ────────────────────────────────────────────────
// Body: { exam_subject_id, marks: [{ student_id, score, remarks? }] }
const enterMarks = async (req, res, next) => {
  try {
    const { id: exam_id } = req.params;
    const { exam_subject_id, marks } = req.body;

    // Fetch max_marks for grade calculation
    const esRes = await query('SELECT max_marks FROM exam_subjects WHERE id=$1', [exam_subject_id]);
    if (!esRes.rows.length) return sendError(res, 'Exam subject not found', 404);
    const max_marks = parseFloat(esRes.rows[0].max_marks);

    for (const m of marks) {
      const pct   = (m.score / max_marks) * 100;
      const grade = getGradeLetter(pct);

      await query(
        `INSERT INTO marks (student_id, exam_subject_id, score, grade, remarks, entered_by)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (student_id, exam_subject_id) DO UPDATE
           SET score=EXCLUDED.score, grade=EXCLUDED.grade,
               remarks=EXCLUDED.remarks, entered_by=EXCLUDED.entered_by, entered_at=NOW()`,
        [m.student_id, exam_subject_id, m.score, grade, m.remarks || null, req.user.id]
      );

      // Notify student
      const stuRes = await query('SELECT user_id FROM students WHERE id=$1', [m.student_id]);
      if (stuRes.rows.length) {
        await createNotification(
          stuRes.rows[0].user_id,
          'Marks Updated',
          `Your marks have been entered: ${m.score}/${max_marks} (${grade})`,
          'info', 'marks', exam_id
        );
      }
    }

    return sendSuccess(res, { count: marks.length }, 'Marks entered successfully');
  } catch (err) { next(err); }
};

// ── GET /api/exams/:id/marks  ─────────────────────────────────────────────────
const getExamMarks = async (req, res, next) => {
  try {
    const { id: exam_id } = req.params;
    const { subject_id } = req.query;

    let q = `
      SELECT m.score, m.grade, m.remarks, m.entered_at,
             st.id AS student_id, st.roll_no, u.name AS student_name,
             es.max_marks, s.name AS subject_name
      FROM marks m
      JOIN students st ON st.id = m.student_id
      JOIN users u ON u.id = st.user_id
      JOIN exam_subjects es ON es.id = m.exam_subject_id
      JOIN subjects s ON s.id = es.subject_id
      WHERE es.exam_id = $1
    `;
    const params = [exam_id];
    if (subject_id) { q += ` AND es.subject_id = $2`; params.push(subject_id); }
    q += ' ORDER BY st.roll_no';

    const result = await query(q, params);
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ── GET /api/exams/:id/result  ────────────────────────────────────────────────
// Full CBSE result card with ranks
const getExamResult = async (req, res, next) => {
  try {
    const { id: exam_id } = req.params;

    const marksRes = await query(
      `SELECT m.score, m.grade,
              st.id AS student_id, st.roll_no, u.name AS student_name,
              es.max_marks, s.name AS subject_name, s.id AS subject_id
       FROM marks m
       JOIN students st ON st.id = m.student_id
       JOIN users u ON u.id = st.user_id
       JOIN exam_subjects es ON es.id = m.exam_subject_id
       JOIN subjects s ON s.id = es.subject_id
       WHERE es.exam_id = $1`,
      [exam_id]
    );

    // Group by student
    const studentMap = {};
    for (const row of marksRes.rows) {
      if (!studentMap[row.student_id]) {
        studentMap[row.student_id] = {
          student_id: row.student_id, roll_no: row.roll_no,
          student_name: row.student_name, subjects: [], total_score: 0,
          grade_points: [],
        };
      }
      const gp = getGradePoint(row.grade);
      studentMap[row.student_id].subjects.push({
        subject_name: row.subject_name, score: row.score,
        max_marks: row.max_marks, grade: row.grade, grade_point: gp,
        passing: isPassing(row.score, row.max_marks),
      });
      studentMap[row.student_id].total_score += parseFloat(row.score);
      studentMap[row.student_id].grade_points.push(gp);
    }

    const students = Object.values(studentMap).map(s => ({
      ...s,
      cgpa: computeCGPA(s.grade_points),
    }));

    const ranked = computeClassRanks(students);
    return sendSuccess(res, ranked);
  } catch (err) { next(err); }
};

module.exports = { getAllExams, getExamById, createExam, updateExam, deleteExam, enterMarks, getExamMarks, getExamResult };
