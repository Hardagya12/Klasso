'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/admin
// ─────────────────────────────────────────────────────────────────────────────
const getAdminDashboard = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const today = new Date().toISOString().split('T')[0];

    const [schoolRes, todayAttRes, classTotalRes, classMarkedRes,
           passRateRes, atRiskRes, pendingReportsRes, feesRes,
           announcementsRes, trendRes] = await Promise.all([
      // School stats
      query(`SELECT sc.name,
               (SELECT COUNT(*) FROM students st JOIN users u ON u.id=st.user_id WHERE st.school_id=$1 AND u.is_active=TRUE)::int AS total_students,
               (SELECT COUNT(*) FROM users WHERE school_id=$1 AND role='teacher' AND is_active=TRUE)::int AS total_teachers,
               (SELECT COUNT(*) FROM classes WHERE school_id=$1)::int AS total_classes
             FROM schools sc WHERE sc.id=$1`, [school_id]),

      // Today attendance
      query(`SELECT ROUND(
               COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric / NULLIF(COUNT(*),0)*100, 2
             ) AS pct
             FROM attendance_records ar
             JOIN attendance_sessions s ON s.id=ar.session_id
             JOIN classes c ON c.id=s.class_id
             WHERE c.school_id=$1 AND s.date=$2`, [school_id, today]),

      query(`SELECT COUNT(DISTINCT id)::int AS total FROM classes WHERE school_id=$1`, [school_id]),

      query(`SELECT COUNT(DISTINCT class_id)::int AS marked
             FROM attendance_sessions WHERE date=$1
               AND class_id IN (SELECT id FROM classes WHERE school_id=$2)`, [today, school_id]),

      // Academic pass rate
      query(`SELECT ROUND(
               COUNT(*) FILTER (WHERE m.score >= es.passing_marks)::numeric / NULLIF(COUNT(*),0)*100,2
             ) AS pass_rate
             FROM marks m
             JOIN exam_subjects es ON es.id=m.exam_subject_id
             JOIN exams e ON e.id=es.exam_id
             JOIN classes c ON c.id=e.class_id
             WHERE c.school_id=$1`, [school_id]),

      // At-risk (below 40% marks)
      query(`SELECT COUNT(DISTINCT m.student_id)::int AS count
             FROM marks m JOIN exam_subjects es ON es.id=m.exam_subject_id
             JOIN exams e ON e.id=es.exam_id JOIN classes c ON c.id=e.class_id
             WHERE c.school_id=$1
             GROUP BY m.student_id
             HAVING AVG(m.score::numeric/es.max_marks::numeric*100) < 40`, [school_id]),

      // Pending reports
      query(`SELECT COUNT(*)::int AS count FROM reports r
             JOIN students st ON st.id=r.student_id
             WHERE st.school_id=$1 AND r.approved=FALSE`, [school_id]),

      // Fees this month
      query(`SELECT COALESCE(SUM(fp.amount_paid),0) AS collected_this_month,
               (SELECT COALESCE(SUM(ft.amount),0) - COALESCE(SUM(fp2.amount_paid),0)
                FROM fee_types ft LEFT JOIN fee_payments fp2 ON fp2.fee_type_id=ft.id AND fp2.status='paid'
                WHERE ft.school_id=$1) AS total_pending
             FROM fee_payments fp
             JOIN students st ON st.id=fp.student_id
             WHERE st.school_id=$1
               AND EXTRACT(MONTH FROM fp.payment_date)=EXTRACT(MONTH FROM NOW())
               AND EXTRACT(YEAR FROM fp.payment_date)=EXTRACT(YEAR FROM NOW())`, [school_id]),

      // Recent announcements
      query(`SELECT id, title, audience, created_at FROM announcements
             WHERE school_id=$1 ORDER BY created_at DESC LIMIT 5`, [school_id]),

      // 7-day attendance trend
      query(`SELECT s.date,
               ROUND(COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric/NULLIF(COUNT(*),0)*100,2) AS pct
             FROM attendance_sessions s
             JOIN attendance_records ar ON ar.session_id=s.id
             JOIN classes c ON c.id=s.class_id
             WHERE c.school_id=$1 AND s.date >= NOW()-INTERVAL '7 days'
             GROUP BY s.date ORDER BY s.date`, [school_id]),
    ]);

    const school = schoolRes.rows[0] || {};
    return sendSuccess(res, {
      school: { name: school.name, total_students: school.total_students, total_teachers: school.total_teachers, total_classes: school.total_classes },
      today: {
        attendance_percentage: parseFloat(todayAttRes.rows[0]?.pct) || 0,
        classes_with_attendance_marked: classMarkedRes.rows[0]?.marked || 0,
        classes_total: classTotalRes.rows[0]?.total || 0,
      },
      academics: {
        overall_pass_rate: parseFloat(passRateRes.rows[0]?.pass_rate) || 0,
        at_risk_students: atRiskRes.rows.length,
        pending_reports: pendingReportsRes.rows[0]?.count || 0,
      },
      fees: {
        collected_this_month: parseFloat(feesRes.rows[0]?.collected_this_month) || 0,
        pending_total: parseFloat(feesRes.rows[0]?.total_pending) || 0,
      },
      recent_announcements: announcementsRes.rows,
      attendance_trend_7days: trendRes.rows.map(r => ({ date: r.date, percentage: parseFloat(r.pct) })),
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/teacher
// ─────────────────────────────────────────────────────────────────────────────
const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacher_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const jsDay = new Date().getDay();
    const todayDbDay = jsDay === 0 ? null : jsDay;

    const [classesRes, scheduleRes, pendingMarksRes, pendingAssignRes, atRiskRes, submissionsRes] = await Promise.all([
      // My classes
      query(`SELECT c.id, c.name, c.section,
               (SELECT COUNT(*)::int FROM students WHERE class_id=c.id) AS student_count,
               EXISTS(SELECT 1 FROM attendance_sessions s WHERE s.class_id=c.id AND s.date=$2)::boolean AS today_attendance_marked
             FROM class_subjects cs JOIN classes c ON c.id=cs.class_id
             WHERE cs.teacher_id=$1 GROUP BY c.id, c.name, c.section ORDER BY c.name`, [teacher_id, today]),

      // Today's schedule
      todayDbDay ? query(`SELECT ts.period_number, ts.start_time, ts.end_time, s.name AS subject, c.name AS class_name, c.section
             FROM timetable_slots ts JOIN class_subjects cs ON cs.id=ts.class_subject_id
             JOIN subjects s ON s.id=cs.subject_id JOIN classes c ON c.id=ts.class_id
             WHERE cs.teacher_id=$1 AND ts.day_of_week=$2 ORDER BY ts.period_number`, [teacher_id, todayDbDay])
        : Promise.resolve({ rows: [] }),

      // Pending marks (exams with missing marks)
      query(`SELECT e.name AS exam_name, c.name AS class_name,
               (SELECT COUNT(*)::int FROM students WHERE class_id=c.id) -
               (SELECT COUNT(DISTINCT m.student_id)::int FROM marks m
                JOIN exam_subjects es2 ON es2.id=m.exam_subject_id WHERE es2.exam_id=e.id) AS pending_count
             FROM exams e JOIN classes c ON c.id=e.class_id
             JOIN class_subjects cs ON cs.class_id=c.id
             WHERE cs.teacher_id=$1
             GROUP BY e.id, e.name, c.id, c.name
             HAVING (SELECT COUNT(*) FROM students WHERE class_id=c.id) >
                    (SELECT COUNT(DISTINCT m2.student_id) FROM marks m2
                     JOIN exam_subjects es3 ON es3.id=m2.exam_subject_id WHERE es3.exam_id=e.id)`, [teacher_id]),

      // Ungraded assignment submissions
      query(`SELECT a.title, c.name AS class_name,
               COUNT(sub.id) FILTER (WHERE sub.status='submitted' OR sub.status='late')::int AS ungraded_count
             FROM assignments a JOIN class_subjects cs ON cs.id=a.class_subject_id
             JOIN classes c ON c.id=cs.class_id
             LEFT JOIN assignment_submissions sub ON sub.assignment_id=a.id AND sub.status NOT IN ('graded')
             WHERE cs.teacher_id=$1
             GROUP BY a.id, a.title, c.name
             HAVING COUNT(sub.id) FILTER (WHERE sub.status IN ('submitted','late')) > 0`, [teacher_id]),

      // At-risk students (low attendance in my classes)
      query(`SELECT u.name, c.name AS class_name,
               ROUND(COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric/NULLIF(COUNT(*),0)*100,2) AS attendance_pct
             FROM students st JOIN users u ON u.id=st.user_id JOIN classes c ON c.id=st.class_id
             JOIN class_subjects cs ON cs.class_id=c.id
             LEFT JOIN attendance_records ar ON ar.student_id=st.id
             WHERE cs.teacher_id=$1
             GROUP BY st.id, u.name, c.name
             HAVING ROUND(COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric/NULLIF(COUNT(*),0)*100,2) < 75
             ORDER BY attendance_pct ASC LIMIT 5`, [teacher_id]),

      // Recent submissions
      query(`SELECT u.name AS student_name, a.title AS assignment_title, sub.submitted_at
             FROM assignment_submissions sub JOIN students st ON st.id=sub.student_id
             JOIN users u ON u.id=st.user_id JOIN assignments a ON a.id=sub.assignment_id
             JOIN class_subjects cs ON cs.id=a.class_subject_id
             WHERE cs.teacher_id=$1 ORDER BY sub.submitted_at DESC LIMIT 5`, [teacher_id]),
    ]);

    return sendSuccess(res, {
      my_classes          : classesRes.rows,
      today_schedule      : scheduleRes.rows,
      pending_marks       : pendingMarksRes.rows,
      pending_assignments : pendingAssignRes.rows,
      at_risk_students    : atRiskRes.rows.map(r => ({ name: r.name, class: r.class_name, issue: 'attendance', value: parseFloat(r.attendance_pct) })),
      recent_submissions  : submissionsRes.rows,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/parent
// ─────────────────────────────────────────────────────────────────────────────
const getParentDashboard = async (req, res, next) => {
  try {
    const parent_id = req.user.id;

    const childrenRes = await query(
      `SELECT st.id, st.roll_no, u.name, c.name AS class_name, c.section
       FROM student_parents sp JOIN students st ON st.id=sp.student_id
       JOIN users u ON u.id=st.user_id LEFT JOIN classes c ON c.id=st.class_id
       WHERE sp.parent_id=$1`, [parent_id]
    );

    const children = await Promise.all(childrenRes.rows.map(async (child) => {
      const [attRes, marksRes, pendingRes, feeRes, notifRes] = await Promise.all([
        query(`SELECT
                 ROUND(COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric/NULLIF(COUNT(*),0)*100,2) AS pct,
                 COUNT(*) FILTER (WHERE ar.status='absent' AND EXTRACT(MONTH FROM s.date)=EXTRACT(MONTH FROM NOW()))::int AS absent_this_month
               FROM attendance_records ar JOIN attendance_sessions s ON s.id=ar.session_id
               WHERE ar.student_id=$1`, [child.id]),
        query(`SELECT e.name AS exam_name,
                 ROUND(SUM(m.score)/NULLIF(SUM(es.max_marks),0)*100,2) AS pct,
                 MAX(m.grade) AS grade
               FROM marks m JOIN exam_subjects es ON es.id=m.exam_subject_id
               JOIN exams e ON e.id=es.exam_id
               WHERE m.student_id=$1 GROUP BY e.id, e.name, e.start_date ORDER BY e.start_date DESC LIMIT 1`, [child.id]),
        query(`SELECT COUNT(*)::int AS count FROM assignments a JOIN class_subjects cs ON cs.id=a.class_subject_id
               WHERE cs.class_id=(SELECT class_id FROM students WHERE id=$1)
                 AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id=$1)
                 AND a.due_date > NOW()`, [child.id]),
        query(`SELECT COALESCE(SUM(ft.amount),0) - COALESCE(SUM(fp.amount_paid),0) AS fee_due
               FROM fee_types ft LEFT JOIN fee_payments fp ON fp.fee_type_id=ft.id AND fp.student_id=$1 AND fp.status='paid'
               WHERE ft.school_id=$2`, [child.id, req.user.school_id]),
        query(`SELECT title, message, created_at FROM notifications
               WHERE user_id=$1 ORDER BY created_at DESC LIMIT 3`, [req.user.id]),
      ]);

      return {
        student: {
          id: child.id,
          name: child.name,
          class: `${child.class_name ?? ''} ${child.section ?? ''}`.trim(),
          roll_no: child.roll_no,
        },
        attendance: { percentage: parseFloat(attRes.rows[0]?.pct) || 0, days_absent_this_month: attRes.rows[0]?.absent_this_month || 0 },
        latest_marks: marksRes.rows[0] || null,
        pending_assignments: pendingRes.rows[0]?.count || 0,
        fee_due: parseFloat(feeRes.rows[0]?.fee_due) || 0,
        recent_notifications: notifRes.rows,
      };
    }));

    return sendSuccess(res, { children });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/student
// ─────────────────────────────────────────────────────────────────────────────
const getStudentDashboard = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const stuRes = await query(
      `SELECT st.id, st.class_id, st.roll_no, c.name AS class_name, c.section
       FROM students st
       LEFT JOIN classes c ON c.id = st.class_id
       WHERE st.user_id=$1`,
      [user_id]
    );
    if (!stuRes.rows.length) return sendError(res, 'Student record not found', 404);
    const { id: student_id, class_id, roll_no, class_name, section } = stuRes.rows[0];

    const jsDay = new Date().getDay();
    const todayDbDay = jsDay === 0 ? null : jsDay;
    const today = new Date().toISOString().split('T')[0];

    const [attRes, attMonthRes, marksRes, timetableRes, pendingRes, examsRes, materialsRes] = await Promise.all([
      // Overall attendance
      query(`SELECT ROUND(COUNT(*) FILTER(WHERE status IN ('present','late'))::numeric/NULLIF(COUNT(*),0)*100,2) AS pct
             FROM attendance_records WHERE student_id=$1`, [student_id]),
      // This month
      query(`SELECT COUNT(*) FILTER(WHERE ar.status='present')::int AS present,
               COUNT(*) FILTER(WHERE ar.status='absent')::int AS absent
             FROM attendance_records ar JOIN attendance_sessions s ON s.id=ar.session_id
             WHERE ar.student_id=$1
               AND EXTRACT(MONTH FROM s.date)=EXTRACT(MONTH FROM NOW())
               AND EXTRACT(YEAR FROM s.date)=EXTRACT(YEAR FROM NOW())`, [student_id]),
      // Latest exam
      query(`SELECT e.name, ROUND(SUM(m.score)/NULLIF(SUM(es.max_marks),0)*100,2) AS pct,
               (SELECT COUNT(*)+1 FROM (
                 SELECT SUM(m2.score) AS ts FROM marks m2 JOIN exam_subjects es2 ON es2.id=m2.exam_subject_id
                 JOIN students st2 ON st2.id=m2.student_id WHERE es2.exam_id=e.id AND st2.class_id=$2
                 GROUP BY m2.student_id HAVING SUM(m2.score)>(SELECT SUM(m3.score) FROM marks m3 WHERE m3.student_id=$1 AND m3.exam_subject_id IN (SELECT id FROM exam_subjects WHERE exam_id=e.id))
               ) sub)::int AS rank
             FROM marks m JOIN exam_subjects es ON es.id=m.exam_subject_id JOIN exams e ON e.id=es.exam_id
             WHERE m.student_id=$1 GROUP BY e.id, e.name, e.start_date ORDER BY e.start_date DESC LIMIT 1`, [student_id, class_id]),
      // Today timetable
      todayDbDay ? query(`SELECT ts.period_number, ts.start_time, ts.end_time, s.name AS subject, u.name AS teacher
             FROM timetable_slots ts JOIN class_subjects cs ON cs.id=ts.class_subject_id
             JOIN subjects s ON s.id=cs.subject_id LEFT JOIN users u ON u.id=cs.teacher_id
             WHERE ts.class_id=$1 AND ts.day_of_week=$2 ORDER BY ts.period_number`, [class_id, todayDbDay])
        : Promise.resolve({ rows: [] }),
      // Pending assignments
      query(`SELECT a.title, s.name AS subject, a.due_date, a.due_date < NOW() AS is_overdue
             FROM assignments a JOIN class_subjects cs ON cs.id=a.class_subject_id
             JOIN subjects s ON s.id=cs.subject_id
             WHERE cs.class_id=$1 AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id=$2)
             ORDER BY a.due_date ASC LIMIT 5`, [class_id, student_id]),
      // Upcoming exams
      query(`SELECT s.name AS subject, es.exam_date,
               GREATEST(0, DATE_PART('day', es.exam_date - NOW()))::int AS days_left
             FROM exam_subjects es JOIN subjects s ON s.id=es.subject_id
             JOIN exams e ON e.id=es.exam_id
             WHERE e.class_id=$1 AND es.exam_date >= NOW()
             ORDER BY es.exam_date LIMIT 5`, [class_id]),
      // New study materials
      query(`SELECT sm.title, s.name AS subject, sm.created_at
             FROM study_materials sm JOIN class_subjects cs ON cs.id=sm.class_subject_id
             JOIN subjects s ON s.id=cs.subject_id
             WHERE cs.class_id=$1 ORDER BY sm.created_at DESC LIMIT 3`, [class_id]),
    ]);

    return sendSuccess(res, {
      student         : {
        name: req.user.name,
        class_id,
        class_name: class_name || null,
        section: section || null,
        roll_no,
      },
      attendance      : { percentage: parseFloat(attRes.rows[0]?.pct)||0, this_month: attMonthRes.rows[0]||{present:0,absent:0} },
      marks           : { latest_exam: marksRes.rows[0]||null },
      today_timetable : timetableRes.rows,
      pending_assignments: pendingRes.rows,
      upcoming_exams  : examsRes.rows,
      study_materials_new: materialsRes.rows,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/class/:id
// ─────────────────────────────────────────────────────────────────────────────
const getClassAnalytics = async (req, res, next) => {
  try {
    const class_id = req.params.id;
    const today = new Date().toISOString().split('T')[0];

    const [classRes, todayAttRes, avgMarksRes, passRes, topRes, atRiskRes] = await Promise.all([
      query(`SELECT c.name, c.section, COUNT(st.id)::int AS student_count FROM classes c
             LEFT JOIN students st ON st.class_id=c.id WHERE c.id=$1 GROUP BY c.id, c.name, c.section`, [class_id]),
      query(`SELECT ROUND(COUNT(*) FILTER(WHERE ar.status IN ('present','late'))::numeric/NULLIF(COUNT(*),0)*100,2) AS pct
             FROM attendance_records ar JOIN attendance_sessions s ON s.id=ar.session_id
             WHERE s.class_id=$1 AND s.date=$2`, [class_id, today]),
      query(`SELECT ROUND(AVG(m.score::numeric/es.max_marks::numeric*100),2) AS avg
             FROM marks m JOIN exam_subjects es ON es.id=m.exam_subject_id
             JOIN exams e ON e.id=es.exam_id WHERE e.class_id=$1`, [class_id]),
      query(`SELECT ROUND(COUNT(*) FILTER(WHERE m.score>=es.passing_marks)::numeric/NULLIF(COUNT(*),0)*100,2) AS pass_rate
             FROM marks m JOIN exam_subjects es ON es.id=m.exam_subject_id
             JOIN exams e ON e.id=es.exam_id WHERE e.class_id=$1`, [class_id]),
      query(`SELECT u.name, st.roll_no, ROUND(AVG(m.score::numeric/es.max_marks::numeric*100),2) AS avg
             FROM students st JOIN users u ON u.id=st.user_id
             JOIN marks m ON m.student_id=st.id JOIN exam_subjects es ON es.id=m.exam_subject_id
             WHERE st.class_id=$1 GROUP BY st.id, u.name, st.roll_no ORDER BY avg DESC LIMIT 3`, [class_id]),
      query(`SELECT u.name, st.roll_no, ROUND(AVG(m.score::numeric/es.max_marks::numeric*100),2) AS avg
             FROM students st JOIN users u ON u.id=st.user_id
             JOIN marks m ON m.student_id=st.id JOIN exam_subjects es ON es.id=m.exam_subject_id
             WHERE st.class_id=$1 GROUP BY st.id, u.name, st.roll_no HAVING AVG(m.score::numeric/es.max_marks::numeric*100) < 40 ORDER BY avg ASC`, [class_id]),
    ]);

    const cls = classRes.rows[0];
    return sendSuccess(res, {
      class: { name: cls?.name, section: cls?.section, student_count: cls?.student_count || 0 },
      today_attendance: parseFloat(todayAttRes.rows[0]?.pct) || 0,
      average_marks: parseFloat(avgMarksRes.rows[0]?.avg) || 0,
      pass_rate: parseFloat(passRes.rows[0]?.pass_rate) || 0,
      top_students: topRes.rows,
      at_risk_students: atRiskRes.rows,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/export/attendance  — ?class_id=&month=&year=
// ─────────────────────────────────────────────────────────────────────────────
const exportAttendanceReport = async (req, res, next) => {
  try {
    const { class_id, month = new Date().getMonth()+1, year = new Date().getFullYear() } = req.query;
    if (!class_id) return sendError(res, 'class_id required', 400);

    // Get all dates for the month that have sessions
    const datesRes = await query(
      `SELECT DISTINCT s.date FROM attendance_sessions s WHERE s.class_id=$1
       AND EXTRACT(MONTH FROM s.date)=$2 AND EXTRACT(YEAR FROM s.date)=$3 ORDER BY s.date`,
      [class_id, month, year]
    );
    const dates = datesRes.rows.map(r => r.date);

    const studentsRes = await query(
      `SELECT st.id, st.roll_no, u.name FROM students st JOIN users u ON u.id=st.user_id
       WHERE st.class_id=$1 ORDER BY st.roll_no`, [class_id]
    );

    const marksRes = await query(
      `SELECT ar.student_id, s.date, ar.status FROM attendance_records ar
       JOIN attendance_sessions s ON s.id=ar.session_id
       WHERE s.class_id=$1 AND EXTRACT(MONTH FROM s.date)=$2 AND EXTRACT(YEAR FROM s.date)=$3`,
      [class_id, month, year]
    );
    const markGrid = {};
    for (const r of marksRes.rows) {
      if (!markGrid[r.student_id]) markGrid[r.student_id] = {};
      markGrid[r.student_id][r.date] = r.status === 'present' ? 'P' : r.status === 'absent' ? 'A' : r.status === 'late' ? 'L' : 'E';
    }

    const rows = studentsRes.rows.map(st => {
      const cells = {};
      let present = 0;
      for (const d of dates) {
        const v = markGrid[st.id]?.[d] || '-';
        cells[d] = v;
        if (v === 'P' || v === 'L') present++;
      }
      const pct = dates.length > 0 ? parseFloat((present/dates.length*100).toFixed(2)) : 0;
      return { roll_no: st.roll_no, name: st.name, ...cells, total: `${present}/${dates.length}`, percentage: pct };
    });

    return sendSuccess(res, { month, year, class_id, dates, rows });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/export/marks  — ?class_id=&exam_id=
// ─────────────────────────────────────────────────────────────────────────────
const exportMarksReport = async (req, res, next) => {
  try {
    const { class_id, exam_id } = req.query;
    if (!class_id || !exam_id) return sendError(res, 'class_id and exam_id required', 400);

    const subjectsRes = await query(
      `SELECT es.id AS exam_subject_id, s.name AS subject_name, es.max_marks FROM exam_subjects es
       JOIN subjects s ON s.id=es.subject_id WHERE es.exam_id=$1 ORDER BY s.name`, [exam_id]
    );
    const subjects = subjectsRes.rows;

    const studentsRes = await query(
      `SELECT st.id, st.roll_no, u.name FROM students st JOIN users u ON u.id=st.user_id
       WHERE st.class_id=$1 ORDER BY st.roll_no`, [class_id]
    );

    const marksRes = await query(
      `SELECT m.student_id, m.exam_subject_id, m.score, m.grade FROM marks m
       JOIN exam_subjects es ON es.id=m.exam_subject_id WHERE es.exam_id=$1
         AND m.student_id IN (SELECT id FROM students WHERE class_id=$2)`, [exam_id, class_id]
    );
    const markIndex = {};
    for (const m of marksRes.rows) {
      if (!markIndex[m.student_id]) markIndex[m.student_id] = {};
      markIndex[m.student_id][m.exam_subject_id] = m;
    }

    const rows = studentsRes.rows.map((st, _, arr) => {
      let total = 0; let maxTotal = 0; const cells = {};
      for (const sub of subjects) {
        const m = markIndex[st.id]?.[sub.exam_subject_id];
        cells[sub.subject_name] = m ? `${m.score} (${m.grade})` : '-';
        if (m) total += parseFloat(m.score);
        maxTotal += parseFloat(sub.max_marks);
      }
      const pct = maxTotal > 0 ? parseFloat((total/maxTotal*100).toFixed(2)) : 0;
      return { roll_no: st.roll_no, name: st.name, ...cells, total: `${total}/${maxTotal}`, percentage: pct };
    });

    // Sort and add rank
    rows.sort((a,b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    rows.forEach((r,i) => { r.rank = i+1; });

    return sendSuccess(res, { exam_id, class_id, subjects: subjects.map(s => s.subject_name), rows });
  } catch (err) { next(err); }
};

module.exports = {
  getAdminDashboard, getTeacherDashboard, getParentDashboard, getStudentDashboard,
  getClassAnalytics, exportAttendanceReport, exportMarksReport,
};
