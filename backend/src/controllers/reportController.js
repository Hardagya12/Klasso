'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { getGradeLetter, computeCGPA, getGradePoint, isPassing } = require('../utils/gradeCalculator');

// ── GET /api/reports/student/:studentId  ─────────────────────────────────────
// Full progress report: all exams, all subjects
const getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { exam_id } = req.query;

    const conditions = ['m.student_id=$1'];
    const params = [studentId];
    let idx = 2;
    if (exam_id) { conditions.push(`es.exam_id=$${idx++}`); params.push(exam_id); }

    const marksRes = await query(
      `SELECT m.score, m.grade, m.remarks,
              es.max_marks, es.passing_marks, es.exam_id,
              s.name AS subject_name, s.code AS subject_code,
              e.name AS exam_name, e.exam_type
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN subjects s ON s.id=es.subject_id
       JOIN exams e ON e.id=es.exam_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.start_date, s.name`,
      params
    );

    const studentRes = await query(
      `SELECT u.name, st.roll_no, st.admission_no, st.dob, st.gender,
              c.name AS class_name, c.section
       FROM students st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN classes c ON c.id=st.class_id
       WHERE st.id=$1`, [studentId]
    );
    if (!studentRes.rows.length) return sendError(res, 'Student not found', 404);

    // Group by exam
    const examMap = {};
    for (const row of marksRes.rows) {
      if (!examMap[row.exam_id]) {
        examMap[row.exam_id] = { exam_name: row.exam_name, exam_type: row.exam_type, subjects: [], grade_points: [] };
      }
      const gp = getGradePoint(row.grade);
      examMap[row.exam_id].grade_points.push(gp);
      examMap[row.exam_id].subjects.push({
        subject_name: row.subject_name, subject_code: row.subject_code,
        score: row.score, max_marks: row.max_marks, grade: row.grade, grade_point: gp,
        passing: isPassing(row.score, row.max_marks), remarks: row.remarks,
      });
    }

    const exams = Object.entries(examMap).map(([eid, data]) => ({
      exam_id: eid, ...data,
      cgpa: computeCGPA(data.grade_points),
    }));

    // Attendance summary
    const attRes = await query(
      `SELECT COUNT(*) FILTER (WHERE ar.status='present') AS present,
              COUNT(*) FILTER (WHERE ar.status='absent')  AS absent,
              COUNT(*) AS total
       FROM attendance_records ar
       JOIN students st ON st.id=ar.student_id
       WHERE st.id=$1`, [studentId]
    );

    return sendSuccess(res, {
      student: studentRes.rows[0],
      exams,
      attendance: attRes.rows[0],
    });
  } catch (err) { next(err); }
};

// ── GET /api/reports/class/:classId  ──────────────────────────────────────────
// Class-wide result for a specific exam
const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { exam_id } = req.query;
    if (!exam_id) return sendError(res, 'exam_id query param required', 400);

    const result = await query(
      `SELECT st.id AS student_id, st.roll_no, u.name AS student_name,
              SUM(m.score) AS total_score,
              COUNT(m.id) AS subjects_appeared,
              AVG((m.score/es.max_marks)*100) AS avg_percentage
       FROM students st
       JOIN users u ON u.id=st.user_id
       JOIN marks m ON m.student_id=st.id
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       WHERE st.class_id=$1 AND es.exam_id=$2
       GROUP BY st.id, st.roll_no, u.name
       ORDER BY total_score DESC`,
      [classId, exam_id]
    );

    // Add rank
    const ranked = result.rows.map((r, i) => ({ ...r, rank: i + 1 }));
    return sendSuccess(res, ranked);
  } catch (err) { next(err); }
};

// ── GET /api/reports/saved  ───────────────────────────────────────────────────
// AI-generated saved reports
const getSavedReports = async (req, res, next) => {
  try {
    const { student_id } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (student_id) { conditions.push(`r.student_id=$${idx++}`); params.push(student_id); }

    // Parents can only see their child
    if (req.user.role === 'parent') {
      conditions.push(
        `r.student_id IN (SELECT student_id FROM student_parents WHERE parent_id=$${idx++})`
      );
      params.push(req.user.id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT r.*, u.name AS student_name, e.name AS exam_name
       FROM reports r
       JOIN students st ON st.id=r.student_id
       JOIN users u ON u.id=st.user_id
       LEFT JOIN exams e ON e.id=r.exam_id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ── POST /api/reports  ────────────────────────────────────────────────────────
const saveReport = async (req, res, next) => {
  try {
    const { student_id, exam_id = null, content } = req.body;
    const result = await query(
      `INSERT INTO reports (student_id, exam_id, content, generated_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [student_id, exam_id, content, req.user.id]
    );
    return sendSuccess(res, result.rows[0], 'Report saved', 201);
  } catch (err) { next(err); }
};

// ── PATCH /api/reports/:id/approve  ──────────────────────────────────────────
const approveReport = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE reports SET approved=TRUE, approved_by=$1, approved_at=NOW()
       WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Report not found', 404);
    return sendSuccess(res, result.rows[0], 'Report approved');
  } catch (err) { next(err); }
};

module.exports = { getStudentReport, getClassReport, getSavedReports, saveReport, approveReport };
