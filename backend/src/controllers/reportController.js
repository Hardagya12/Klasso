'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { getGradeLetter } = require('../utils/gradeCalculator');
const { generateStudentReport } = require('../utils/claudeApi');
const { createNotification, createNotificationsForMany } = require('../utils/notificationHelper');

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: build studentData object for Claude
// ─────────────────────────────────────────────────────────────────────────────
const buildStudentData = async (student_id) => {
  // Student + class info
  const stuRes = await query(
    `SELECT u.name, c.name AS class_name, c.section, st.user_id
     FROM students st
     JOIN users u ON u.id=st.user_id
     LEFT JOIN classes c ON c.id=st.class_id
     WHERE st.id=$1`, [student_id]
  );
  if (!stuRes.rows.length) return null;
  const stu = stuRes.rows[0];

  // Attendance percentage
  const attRes = await query(
    `SELECT
       COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric AS attended,
       COUNT(*)::numeric AS total
     FROM attendance_records ar WHERE ar.student_id=$1`, [student_id]
  );
  const a = attRes.rows[0];
  const attendance_percentage = parseFloat(a.total) > 0
    ? parseFloat((parseFloat(a.attended) / parseFloat(a.total) * 100).toFixed(2))
    : 0;

  // All marks
  const marksRes = await query(
    `SELECT s.name AS subject, m.score, es.max_marks, m.grade
     FROM marks m
     JOIN exam_subjects es ON es.id=m.exam_subject_id
     JOIN subjects s ON s.id=es.subject_id
     WHERE m.student_id=$1
     ORDER BY s.name`, [student_id]
  );
  const marks = marksRes.rows;

  // Overall percentage
  const totalScore = marks.reduce((s, m) => s + parseFloat(m.score), 0);
  const maxScore   = marks.reduce((s, m) => s + parseFloat(m.max_marks), 0);
  const overall_percentage = maxScore > 0 ? parseFloat((totalScore / maxScore * 100).toFixed(2)) : 0;
  const overall_grade = getGradeLetter(overall_percentage);

  return {
    student_id,
    user_id: stu.user_id,
    name: stu.name,
    class_name: stu.class_name,
    section: stu.section,
    attendance_percentage,
    marks,
    overall_percentage,
    overall_grade,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports/generate/:student_id
// ─────────────────────────────────────────────────────────────────────────────
const generateReport = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const { exam_id = null } = req.body;

    const studentData = await buildStudentData(student_id);
    if (!studentData) return sendError(res, 'Student not found', 404);

    let content;
    try {
      content = await generateStudentReport(studentData);
    } catch (apiErr) {
      console.error('[Claude API Error]', apiErr.message);
      return res.status(503).json({
        success: false,
        message: 'AI report generation is temporarily unavailable. Please try again later.',
        detail: apiErr.message,
      });
    }

    const result = await query(
      `INSERT INTO reports (student_id, exam_id, content, generated_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [student_id, exam_id, content, req.user.id]
    );
    const report = result.rows[0];

    // Notify student
    await createNotification(
      studentData.user_id,
      'Progress Report Ready',
      'Your end-of-term progress report has been generated. Log in to view it.',
      'success', 'report', report.id
    );

    // Notify parents
    const parentRes = await query(
      'SELECT parent_id FROM student_parents WHERE student_id=$1', [student_id]
    );
    const parentIds = parentRes.rows.map(r => r.parent_id);
    if (parentIds.length) {
      await createNotificationsForMany(
        parentIds,
        'Child Progress Report Ready',
        `${studentData.name}'s progress report is now available. Log in to view it.`,
        'success', 'report', report.id
      );
    }

    return sendSuccess(res, {
      report: {
        id: report.id,
        content,
        student: { name: studentData.name, class_name: studentData.class_name },
        generated_at: report.created_at,
      },
    }, 'Report generated successfully', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports/generate-bulk/:class_id
// ─────────────────────────────────────────────────────────────────────────────
const generateBulkReports = async (req, res, next) => {
  try {
    const { class_id } = req.params;
    const { exam_id = null } = req.body;

    const studentsRes = await query(
      'SELECT id FROM students WHERE class_id=$1', [class_id]
    );
    if (!studentsRes.rows.length) return sendError(res, 'No students in this class', 404);

    const results = [];
    const DELAY_MS = 300;

    const tasks = studentsRes.rows.map((stu, idx) => async () => {
      // Stagger API calls
      await new Promise(r => setTimeout(r, idx * DELAY_MS));
      try {
        const studentData = await buildStudentData(stu.id);
        if (!studentData) throw new Error('Student data not found');

        const content = await generateStudentReport(studentData);

        const reportRes = await query(
          `INSERT INTO reports (student_id, exam_id, content, generated_by)
           VALUES ($1,$2,$3,$4) RETURNING id`,
          [stu.id, exam_id, content, req.user.id]
        );

        return { student_id: stu.id, name: studentData.name, report_id: reportRes.rows[0].id, status: 'generated' };
      } catch (e) {
        return { student_id: stu.id, status: 'failed', reason: e.message };
      }
    });

    // Use allSettled to not block on individual failures
    const settled = await Promise.allSettled(tasks.map(t => t()));
    for (const s of settled) {
      results.push(s.status === 'fulfilled' ? s.value : { status: 'failed', reason: s.reason?.message });
    }

    const generated = results.filter(r => r.status === 'generated').length;
    const failed    = results.filter(r => r.status === 'failed').length;

    return sendSuccess(res, { generated, failed, results }, `Generated ${generated} reports`);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/student/:student_id
// ─────────────────────────────────────────────────────────────────────────────
const getStudentReports = async (req, res, next) => {
  try {
    const { student_id } = req.params;

    // Parent scope check
    if (req.user.role === 'parent') {
      const check = await query(
        'SELECT 1 FROM student_parents WHERE student_id=$1 AND parent_id=$2',
        [student_id, req.user.id]
      );
      if (!check.rows.length) return sendError(res, 'Access denied', 403);
    }

    const result = await query(
      `SELECT r.*, u.name AS generated_by_name, e.name AS exam_name,
              approver.name AS approved_by_name
       FROM reports r
       LEFT JOIN users u ON u.id=r.generated_by
       LEFT JOIN exams e ON e.id=r.exam_id
       LEFT JOIN users approver ON approver.id=r.approved_by
       WHERE r.student_id=$1
       ORDER BY r.created_at DESC`,
      [student_id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/:id
// ─────────────────────────────────────────────────────────────────────────────
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT r.*,
              u_stu.name AS student_name, u_stu.email AS student_email,
              c.name AS class_name, c.section,
              u_gen.name AS generated_by_name,
              e.name AS exam_name,
              u_app.name AS approved_by_name
       FROM reports r
       JOIN students st ON st.id=r.student_id
       JOIN users u_stu ON u_stu.id=st.user_id
       LEFT JOIN classes c ON c.id=st.class_id
       LEFT JOIN users u_gen ON u_gen.id=r.generated_by
       LEFT JOIN exams e ON e.id=r.exam_id
       LEFT JOIN users u_app ON u_app.id=r.approved_by
       WHERE r.id=$1`, [id]
    );
    if (!result.rows.length) return sendError(res, 'Report not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/reports/:id/approve
// ─────────────────────────────────────────────────────────────────────────────
const approveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body; // optional edit before approving

    const updates = ['approved=TRUE', 'approved_by=$1', 'approved_at=NOW()'];
    const params  = [req.user.id];
    let idx = 2;

    if (content !== undefined) {
      updates.push(`content=$${idx++}`);
      params.push(content);
    }

    params.push(id);
    const result = await query(
      `UPDATE reports SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Report not found', 404);

    const report = result.rows[0];

    // Notify parent(s)
    const parentRes = await query(
      `SELECT sp.parent_id, u.name AS student_name
       FROM student_parents sp
       JOIN students st ON st.id=sp.student_id
       JOIN users u ON u.id=st.user_id
       WHERE sp.student_id=$1`, [report.student_id]
    );

    if (parentRes.rows.length) {
      const pids         = parentRes.rows.map(r => r.parent_id);
      const student_name = parentRes.rows[0].student_name;
      await createNotificationsForMany(
        pids,
        'Progress Report Available',
        `Progress report for ${student_name} has been approved and is now available to view.`,
        'success', 'report', report.id
      );
    }

    return sendSuccess(res, report, 'Report approved');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/reports/:id  — edit content before approval
// ─────────────────────────────────────────────────────────────────────────────
const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return sendError(res, 'content is required', 400);

    const result = await query(
      'UPDATE reports SET content=$1 WHERE id=$2 AND approved=FALSE RETURNING *',
      [content, id]
    );
    if (!result.rows.length) {
      return sendError(res, 'Report not found or already approved (cannot edit approved reports)', 404);
    }
    return sendSuccess(res, result.rows[0], 'Report updated');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/reports/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteReport = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM reports WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Report not found', 404);
    return sendSuccess(res, null, 'Report deleted');
  } catch (err) { next(err); }
};

module.exports = {
  generateReport, generateBulkReports,
  getStudentReports, getReportById,
  approveReport, updateReport, deleteReport,
};
