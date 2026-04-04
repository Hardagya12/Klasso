'use strict';

const { pool, query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const {
  getGradeLetter, getGradePoint, computeCGPA,
  computeClassRanks, isPassing,
} = require('../utils/gradeCalculator');
const { createNotification, createNotificationsForMany } = require('../utils/notificationHelper');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/marks/bulk
// ─────────────────────────────────────────────────────────────────────────────
const bulkInsertMarks = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { exam_id, marks } = req.body;
    // marks = [{ student_id, subject_id, score, remarks }]

    await client.query('BEGIN');

    let inserted = 0;
    let updated  = 0;
    const notifyUserIds = new Set();

    for (const m of marks) {
      // Resolve exam_subject_id and max_marks
      const esRes = await client.query(
        `SELECT id, max_marks FROM exam_subjects WHERE exam_id=$1 AND subject_id=$2`,
        [exam_id, m.subject_id]
      );
      if (!esRes.rows.length) continue; // skip if subject not in exam

      const es = esRes.rows[0];
      const pct   = parseFloat(m.score) / parseFloat(es.max_marks) * 100;
      const grade = getGradeLetter(pct);

      const res = await client.query(
        `INSERT INTO marks (student_id, exam_subject_id, score, grade, remarks, entered_by)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (student_id, exam_subject_id) DO UPDATE
           SET score=EXCLUDED.score, grade=EXCLUDED.grade,
               remarks=EXCLUDED.remarks, entered_by=EXCLUDED.entered_by, entered_at=NOW()
         RETURNING (xmax = 0) AS is_insert`,
        [m.student_id, es.id, m.score, grade, m.remarks || null, req.user.id]
      );

      if (res.rows[0].is_insert) inserted++; else updated++;

      // Collect user_id for notification
      const stuRes = await client.query(
        'SELECT user_id FROM students WHERE id=$1', [m.student_id]
      );
      if (stuRes.rows.length) notifyUserIds.add(stuRes.rows[0].user_id);
    }

    await client.query('COMMIT');

    // Notify students + parents (fire-and-forget)
    if (notifyUserIds.size) {
      const uids = [...notifyUserIds];
      // also fetch parent ids
      const parentRes = await query(
        `SELECT sp.parent_id
         FROM student_parents sp
         JOIN students st ON st.id=sp.student_id
         WHERE st.user_id = ANY($1::uuid[])`,
        [uids]
      );
      const parentIds = parentRes.rows.map(r => r.parent_id);
      const all = [...new Set([...uids, ...parentIds])];
      createNotificationsForMany(all,
        'Marks Published',
        'Your marks have been entered for a recent exam. Log in to view your result.',
        'success', 'marks', exam_id
      ).catch(e => console.error('[marks notification]', e.message));
    }

    return sendSuccess(res, { inserted, updated }, 'Marks saved successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marks  — spreadsheet grid ?class_id=&exam_id=
// ─────────────────────────────────────────────────────────────────────────────
const getMarksGrid = async (req, res, next) => {
  try {
    const { class_id, exam_id } = req.query;
    if (!class_id || !exam_id) return sendError(res, 'class_id and exam_id are required', 400);

    // Fetch exam meta
    const examRes = await query(
      `SELECT e.id, e.name, e.exam_type, e.start_date, e.end_date
       FROM exams e WHERE e.id=$1`, [exam_id]
    );
    if (!examRes.rows.length) return sendError(res, 'Exam not found', 404);
    const exam = examRes.rows[0];

    // Fetch subjects in this exam
    const subjectsRes = await query(
      `SELECT es.id AS exam_subject_id, es.max_marks, es.passing_marks,
              s.id AS subject_id, s.name, s.code
       FROM exam_subjects es
       JOIN subjects s ON s.id = es.subject_id
       WHERE es.exam_id = $1
       ORDER BY s.name`,
      [exam_id]
    );
    const subjects = subjectsRes.rows;

    // Fetch all students in class
    const studentsRes = await query(
      `SELECT st.id, st.roll_no, u.name
       FROM students st JOIN users u ON u.id=st.user_id
       WHERE st.class_id=$1 ORDER BY st.roll_no`,
      [class_id]
    );

    // Fetch all marks for this exam + class
    const marksRes = await query(
      `SELECT m.id, m.student_id, es.subject_id, m.score, m.grade, m.remarks
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       WHERE es.exam_id=$1
         AND m.student_id IN (SELECT id FROM students WHERE class_id=$2)`,
      [exam_id, class_id]
    );

    // Index marks: { student_id: { subject_id: markRow } }
    const marksIndex = {};
    for (const m of marksRes.rows) {
      if (!marksIndex[m.student_id]) marksIndex[m.student_id] = {};
      marksIndex[m.student_id][m.subject_id] = m;
    }

    // Build rows
    const rows = studentsRes.rows.map(stu => {
      let totalScore = 0;
      let maxScore   = 0;
      const gradePoints = [];
      const marksMap = {};

      for (const subj of subjects) {
        const m = marksIndex[stu.id]?.[subj.subject_id];
        if (m) {
          const passed = isPassing(m.score, subj.max_marks);
          marksMap[subj.subject_id] = { id: m.id, score: m.score, grade: m.grade, remarks: m.remarks, passed };
          totalScore += parseFloat(m.score);
          maxScore   += parseFloat(subj.max_marks);
          gradePoints.push(getGradePoint(m.grade));
        } else {
          marksMap[subj.subject_id] = null;
          maxScore += parseFloat(subj.max_marks);
        }
      }

      const percentage = maxScore > 0 ? parseFloat((totalScore / maxScore * 100).toFixed(2)) : 0;
      const cgpa       = computeCGPA(gradePoints);

      return {
        student: { id: stu.id, roll_no: stu.roll_no, name: stu.name },
        marks: marksMap,
        totals: {
          score: totalScore, max_score: maxScore, percentage,
          grade: getGradeLetter(percentage), cgpa,
          total_score: totalScore, // used by computeClassRanks
        },
      };
    });

    // Compute ranks
    const withRanks = computeClassRanks(
      rows.map(r => ({ ...r, total_score: r.totals.score }))
    );
    rows.forEach((r, i) => { r.totals.rank = withRanks[i]?.rank ?? null; });

    return sendSuccess(res, {
      exam: {
        id: exam.id, name: exam.name, type: exam.exam_type,
        date_range: { start: exam.start_date, end: exam.end_date },
      },
      subjects,
      rows: rows.sort((a, b) => (a.totals.rank || 999) - (b.totals.rank || 999)),
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marks/student/:student_id
// ─────────────────────────────────────────────────────────────────────────────
const getStudentMarks = async (req, res, next) => {
  try {
    const { student_id } = req.params;

    // Student meta
    const stuRes = await query(
      `SELECT u.name, st.roll_no, st.class_id FROM students st
       JOIN users u ON u.id=st.user_id WHERE st.id=$1`, [student_id]
    );
    if (!stuRes.rows.length) return sendError(res, 'Student not found', 404);
    const stu = stuRes.rows[0];

    // All marks grouped by exam
    const marksRes = await query(
      `SELECT e.id AS exam_id, e.name AS exam_name, e.exam_type,
              s.name AS subject_name, s.id AS subject_id,
              m.score, es.max_marks, es.passing_marks,
              m.grade, m.remarks
       FROM marks m
       JOIN exam_subjects es ON es.id = m.exam_subject_id
       JOIN exams e ON e.id = es.exam_id
       JOIN subjects s ON s.id = es.subject_id
       WHERE m.student_id = $1
       ORDER BY e.start_date, s.name`,
      [student_id]
    );

    // Group by exam
    const examMap = {};
    const subjectTrend = {}; // { subject_id: [ { exam_name, pct } ] }
    const allExamLabels = [];

    for (const row of marksRes.rows) {
      if (!examMap[row.exam_id]) {
        examMap[row.exam_id] = {
          exam: { id: row.exam_id, name: row.exam_name, type: row.exam_type },
          subjects: [],
          grade_points: [],
        };
        allExamLabels.push(row.exam_name);
      }
      const passed = isPassing(row.score, row.max_marks);
      examMap[row.exam_id].subjects.push({
        name: row.subject_name, score: row.score,
        max_marks: row.max_marks, grade: row.grade, passed,
      });
      examMap[row.exam_id].grade_points.push(getGradePoint(row.grade));

      // Build trend data
      if (!subjectTrend[row.subject_name]) subjectTrend[row.subject_name] = {};
      subjectTrend[row.subject_name][row.exam_name] =
        parseFloat((row.score / row.max_marks * 100).toFixed(2));
    }

    // Compute totals per exam — also fetch class rank
    const exams = await Promise.all(
      Object.values(examMap).map(async (e) => {
        const totalScore = e.subjects.reduce((s, m) => s + parseFloat(m.score), 0);
        const maxScore   = e.subjects.reduce((s, m) => s + parseFloat(m.max_marks), 0);
        const pct        = maxScore > 0 ? parseFloat((totalScore / maxScore * 100).toFixed(2)) : 0;
        const cgpa       = computeCGPA(e.grade_points);
        const overallGrade = getGradeLetter(pct);

        // Rank in class for this exam
        const classRes = await query(
          `SELECT COUNT(*) AS higher FROM (
             SELECT SUM(m2.score) AS total
             FROM marks m2
             JOIN exam_subjects es2 ON es2.id=m2.exam_subject_id
             JOIN students st2 ON st2.id=m2.student_id
             WHERE es2.exam_id=$1 AND st2.class_id=$2
             GROUP BY m2.student_id
             HAVING SUM(m2.score) > $3
           ) sub`,
          [e.exam.id, stu.class_id, totalScore]
        );
        const rank_in_class = parseInt(classRes.rows[0].higher) + 1;

        return {
          exam: e.exam,
          subjects: e.subjects,
          totals: { score: totalScore, max_score: maxScore, percentage: pct, overall_grade: overallGrade, cgpa, rank_in_class },
        };
      })
    );

    // Build chart datasets
    const uniqueExamLabels = [...new Set(allExamLabels)];
    const datasets = Object.entries(subjectTrend).map(([subjectName, examData]) => ({
      subject: subjectName,
      data: uniqueExamLabels.map(label => examData[label] ?? null),
    }));

    return sendSuccess(res, {
      student: { name: stu.name, roll_no: stu.roll_no },
      exams,
      chart_data: { labels: uniqueExamLabels, datasets },
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marks/analytics/class/:class_id
// ─────────────────────────────────────────────────────────────────────────────
const getClassAnalytics = async (req, res, next) => {
  try {
    const { class_id } = req.params;

    // Exam trend
    const examTrendRes = await query(
      `SELECT e.name AS exam_name,
              ROUND(AVG(m.score::numeric / es.max_marks::numeric * 100), 2) AS avg_percentage
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN exams e ON e.id=es.exam_id
       JOIN students st ON st.id=m.student_id
       WHERE st.class_id=$1
       GROUP BY e.id, e.name, e.start_date
       ORDER BY e.start_date`,
      [class_id]
    );

    // Subject averages + pass rate
    const subjectRes = await query(
      `SELECT s.name AS subject_name,
              ROUND(AVG(m.score::numeric / es.max_marks::numeric * 100), 2) AS avg_percentage,
              ROUND(
                COUNT(*) FILTER (WHERE m.score >= es.passing_marks)::numeric / NULLIF(COUNT(*),0) * 100, 2
              ) AS pass_rate
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN subjects s ON s.id=es.subject_id
       JOIN students st ON st.id=m.student_id
       WHERE st.class_id=$1
       GROUP BY s.id, s.name
       ORDER BY avg_percentage DESC`,
      [class_id]
    );

    // Grade distribution across ALL marks
    const gradeRes = await query(
      `SELECT m.grade, COUNT(*)::int AS count
       FROM marks m
       JOIN students st ON st.id=m.student_id
       WHERE st.class_id=$1
       GROUP BY m.grade`,
      [class_id]
    );
    const gradeDist = { A1:0,A2:0,B1:0,B2:0,C1:0,C2:0,D:0,E:0,F:0 };
    gradeRes.rows.forEach(r => { if (r.grade in gradeDist) gradeDist[r.grade] = r.count; });

    // Top 5 students (avg percentage across all exams)
    const topRes = await query(
      `SELECT u.name, st.roll_no,
              ROUND(AVG(m.score::numeric / es.max_marks::numeric * 100), 2) AS avg_percentage
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN students st ON st.id=m.student_id
       JOIN users u ON u.id=st.user_id
       WHERE st.class_id=$1
       GROUP BY st.id, u.name, st.roll_no
       ORDER BY avg_percentage DESC LIMIT 5`,
      [class_id]
    );

    // At-risk students (below 40%)
    const atRiskRes = await query(
      `SELECT u.name, st.roll_no,
              ROUND(AVG(m.score::numeric / es.max_marks::numeric * 100), 2) AS avg_percentage
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN students st ON st.id=m.student_id
       JOIN users u ON u.id=st.user_id
       WHERE st.class_id=$1
       GROUP BY st.id, u.name, st.roll_no
       HAVING AVG(m.score::numeric / es.max_marks::numeric * 100) < 40
       ORDER BY avg_percentage ASC`,
      [class_id]
    );

    // Class pass rate
    const passRes = await query(
      `SELECT ROUND(
         COUNT(*) FILTER (WHERE m.score >= es.passing_marks)::numeric / NULLIF(COUNT(*),0)*100, 2
       ) AS class_pass_rate
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN students st ON st.id=m.student_id
       WHERE st.class_id=$1`,
      [class_id]
    );

    return sendSuccess(res, {
      exam_trend        : examTrendRes.rows,
      subject_averages  : subjectRes.rows,
      grade_distribution: gradeDist,
      top_students      : topRes.rows,
      at_risk_students  : atRiskRes.rows,
      class_pass_rate   : parseFloat(passRes.rows[0].class_pass_rate) || 0,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marks/analytics/student/:id  — chart-ready trend
// ─────────────────────────────────────────────────────────────────────────────
const getStudentTrend = async (req, res, next) => {
  try {
    const { id: student_id } = req.params;

    const marksRes = await query(
      `SELECT e.name AS exam_name, e.start_date,
              s.name AS subject_name,
              ROUND(m.score::numeric / es.max_marks::numeric * 100, 2) AS pct
       FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       JOIN exams e ON e.id=es.exam_id
       JOIN subjects s ON s.id=es.subject_id
       WHERE m.student_id=$1
       ORDER BY e.start_date, s.name`,
      [student_id]
    );

    // Build chart data
    const examLabels    = [...new Set(marksRes.rows.map(r => r.exam_name))];
    const subjectGroups = {};
    for (const r of marksRes.rows) {
      if (!subjectGroups[r.subject_name]) subjectGroups[r.subject_name] = {};
      subjectGroups[r.subject_name][r.exam_name] = parseFloat(r.pct);
    }

    const datasets = Object.entries(subjectGroups).map(([subject, examData]) => ({
      subject,
      data: examLabels.map(label => examData[label] ?? null),
    }));

    return sendSuccess(res, { labels: examLabels, datasets });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/marks/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateMark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, remarks } = req.body;

    // Fetch max_marks to recompute grade
    const existing = await query(
      `SELECT m.*, es.max_marks FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id
       WHERE m.id=$1`, [id]
    );
    if (!existing.rows.length) return sendError(res, 'Mark not found', 404);
    const row = existing.rows[0];

    const newScore  = score !== undefined ? score : row.score;
    const newGrade  = getGradeLetter(parseFloat(newScore) / parseFloat(row.max_marks) * 100);
    const newRemark = remarks !== undefined ? remarks : row.remarks;

    const result = await query(
      `UPDATE marks SET score=$1, grade=$2, remarks=$3, entered_by=$4, entered_at=NOW()
       WHERE id=$5 RETURNING *`,
      [newScore, newGrade, newRemark, req.user.id, id]
    );

    return sendSuccess(res, result.rows[0], 'Mark updated');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/marks/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteMark = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM marks WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Mark not found', 404);
    return sendSuccess(res, null, 'Mark deleted');
  } catch (err) { next(err); }
};

module.exports = {
  bulkInsertMarks, getMarksGrid, getStudentMarks,
  getClassAnalytics, getStudentTrend, updateMark, deleteMark,
};
