'use strict';

const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotification, createNotificationsForMany } = require('../utils/notificationHelper');

// ─────────────────────────────────────────────────────────────────────────────
// Internal: checkAndNotifyLowAttendance
// Called after any mark operation to detect students who just dropped below 75%
// ─────────────────────────────────────────────────────────────────────────────
const checkAndNotifyLowAttendance = async (class_id) => {
  try {
    const threshold = 75;

    const result = await query(
      `SELECT
         st.id AS student_id,
         u.name AS student_name,
         c.class_teacher_id,
         COUNT(*)                                                          AS total,
         COUNT(*) FILTER (WHERE ar.status IN ('present','late'))           AS attended,
         ROUND(
           COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric
           / NULLIF(COUNT(*),0) * 100, 2
         )                                                                 AS pct
       FROM students st
       JOIN users u ON u.id = st.user_id
       JOIN classes c ON c.id = st.class_id
       JOIN attendance_records ar ON ar.student_id = st.id
       JOIN attendance_sessions s ON s.id = ar.session_id AND s.class_id = $1
       WHERE st.class_id = $1
       GROUP BY st.id, u.name, c.class_teacher_id`,
      [class_id]
    );

    for (const row of result.rows) {
      if (parseFloat(row.pct) < threshold) {
        // Notify parents
        const parentRes = await query(
          `SELECT parent_id FROM student_parents WHERE student_id=$1`, [row.student_id]
        );
        const parentIds = parentRes.rows.map(r => r.parent_id);
        if (parentIds.length) {
          await createNotificationsForMany(
            parentIds,
            'Attendance Alert',
            `${row.student_name}'s attendance has dropped to ${row.pct}%. Minimum required is ${threshold}%.`,
            'warning', 'attendance', row.student_id
          );
        }
        // Notify class teacher
        if (row.class_teacher_id) {
          await createNotification(
            row.class_teacher_id,
            'Low Attendance Alert',
            `${row.student_name} is at ${row.pct}% attendance (below ${threshold}%).`,
            'warning', 'attendance', row.student_id
          );
        }
      }
    }
  } catch (err) {
    console.error('[checkAndNotifyLowAttendance]', err.message);
    // Non-fatal — don't throw
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/session/start
// ─────────────────────────────────────────────────────────────────────────────
const startSession = async (req, res, next) => {
  try {
    const {
      class_id,
      date          = new Date().toISOString().split('T')[0],
      session_type  = 'daily',
      class_subject_id = null,
    } = req.body;

    // Check if session already exists
    const existing = await query(
      `SELECT * FROM attendance_sessions
       WHERE class_id=$1 AND date=$2 AND session_type=$3`,
      [class_id, date, session_type]
    );

    if (existing.rows.length) {
      return sendSuccess(res, existing.rows[0], 'Session already exists');
    }

    const result = await query(
      `INSERT INTO attendance_sessions (class_id, class_subject_id, date, session_type, marked_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [class_id, class_subject_id, date, session_type, req.user.id]
    );

    return sendSuccess(res, result.rows[0], 'Attendance session started', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/mark  — bulk manual mark
// ─────────────────────────────────────────────────────────────────────────────
const markAttendance = async (req, res, next) => {
  try {
    const { session_id, class_id, records } = req.body;
    // records = [{ student_id, status ('present'|'absent'|'late'|'excused'), remark }]

    let sid = session_id;

    // Auto-create today's session if not provided
    if (!sid) {
      if (!class_id) return sendError(res, 'Provide session_id or class_id', 400);
      const today = new Date().toISOString().split('T')[0];
      const sessRes = await query(
        `INSERT INTO attendance_sessions (class_id, date, session_type, marked_by)
         VALUES ($1,$2,'daily',$3)
         ON CONFLICT (class_id, date, session_type) DO UPDATE
           SET marked_by = EXCLUDED.marked_by
         RETURNING id`,
        [class_id, today, req.user.id]
      );
      sid = sessRes.rows[0].id;
    }

    // Verify session exists and get class_id
    const sessCheck = await query('SELECT class_id FROM attendance_sessions WHERE id=$1', [sid]);
    if (!sessCheck.rows.length) return sendError(res, 'Session not found', 404);
    const resolvedClassId = sessCheck.rows[0].class_id;

    for (const r of records) {
      await query(
        `INSERT INTO attendance_records (session_id, student_id, status, remark)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (session_id, student_id) DO UPDATE
           SET status = EXCLUDED.status, remark = EXCLUDED.remark`,
        [sid, r.student_id, r.status, r.remark || null]
      );
    }

    // Fire-and-forget low attendance check
    checkAndNotifyLowAttendance(resolvedClassId);

    return sendSuccess(res, {
      marked: records.length,
      session_id: sid,
      date: new Date().toISOString().split('T')[0],
    }, 'Attendance marked successfully');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/qr/generate
// ─────────────────────────────────────────────────────────────────────────────
const generateQRToken = async (req, res, next) => {
  try {
    const { class_id } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Auto-create today's session
    const sessRes = await query(
      `INSERT INTO attendance_sessions (class_id, date, session_type, marked_by)
       VALUES ($1,$2,'daily',$3)
       ON CONFLICT (class_id, date, session_type) DO UPDATE
         SET marked_by = EXCLUDED.marked_by
       RETURNING id`,
      [class_id, today, req.user.id]
    );
    const session_id = sessRes.rows[0].id;

    // Delete expired tokens for this class
    await query(
      `DELETE FROM qr_tokens WHERE class_id=$1 AND expires_at < NOW()`,
      [class_id]
    );

    const token      = uuidv4();
    const expires_at = new Date(Date.now() + 30 * 1000).toISOString(); // 30 seconds

    const tokenRes = await query(
      `INSERT INTO qr_tokens (class_id, token, session_id, expires_at)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [class_id, token, session_id, expires_at]
    );

    return sendSuccess(res, {
      token,
      session_id,
      expires_at: tokenRes.rows[0].expires_at,
      class_id,
    }, 'QR token generated', 201);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/qr/scan  — PUBLIC (no auth)
// ─────────────────────────────────────────────────────────────────────────────
const scanQRToken = async (req, res, next) => {
  try {
    const { token, student_id, roll_no, class_id } = req.body;

    if (!token) return sendError(res, 'Token required', 400);

    // Validate token
    const tokenRes = await query(
      `SELECT qt.*, s.class_id AS session_class_id
       FROM qr_tokens qt
       JOIN attendance_sessions s ON s.id = qt.session_id
       WHERE qt.token=$1 AND qt.expires_at > NOW()`,
      [token]
    );
    if (!tokenRes.rows.length) return sendError(res, 'QR token is invalid or has expired', 400);
    const qr = tokenRes.rows[0];

    // Resolve student record
    let resolvedStudentId = student_id;

    if (!resolvedStudentId && roll_no && class_id) {
      const stuRes = await query(
        `SELECT id FROM students WHERE roll_no=$1 AND class_id=$2`, [roll_no, class_id]
      );
      if (!stuRes.rows.length) return sendError(res, 'Student not found with given roll_no and class_id', 404);
      resolvedStudentId = stuRes.rows[0].id;
    }

    if (!resolvedStudentId) return sendError(res, 'Provide student_id or roll_no+class_id', 400);

    // Verify student belongs to the session's class
    const stuClassRes = await query(
      `SELECT u.name FROM students st JOIN users u ON u.id=st.user_id
       WHERE st.id=$1 AND st.class_id=$2`,
      [resolvedStudentId, qr.session_class_id]
    );
    if (!stuClassRes.rows.length) {
      return sendError(res, 'Student does not belong to this class', 403);
    }

    await query(
      `INSERT INTO attendance_records (session_id, student_id, status)
       VALUES ($1,$2,'present')
       ON CONFLICT (session_id, student_id) DO NOTHING`,
      [qr.session_id, resolvedStudentId]
    );

    return sendSuccess(res, {
      success: true,
      student_name: stuClassRes.rows[0].name,
      marked_at: new Date().toISOString(),
    }, 'Attendance marked as present');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/voice  — voice roll call simulation
// ─────────────────────────────────────────────────────────────────────────────
const voiceAttendance = async (req, res, next) => {
  try {
    const {
      class_id,
      present_names = [],
      date = new Date().toISOString().split('T')[0],
    } = req.body;

    // Create / fetch session
    const sessRes = await query(
      `INSERT INTO attendance_sessions (class_id, date, session_type, marked_by)
       VALUES ($1,$2,'daily',$3)
       ON CONFLICT (class_id, date, session_type) DO UPDATE
         SET marked_by = EXCLUDED.marked_by
       RETURNING id`,
      [class_id, date, req.user.id]
    );
    const session_id = sessRes.rows[0].id;

    // Fetch all students in class
    const allStudents = await query(
      `SELECT st.id, u.name FROM students st
       JOIN users u ON u.id=st.user_id
       WHERE st.class_id=$1`,
      [class_id]
    );

    const matchedStudentIds = new Set();
    const presentList       = [];
    const unrecognizedNames = [...present_names];

    // Fuzzy match: for each provided name, look for ILIKE match in student names
    for (const providedName of present_names) {
      const matchRes = await query(
        `SELECT st.id, u.name FROM students st
         JOIN users u ON u.id=st.user_id
         WHERE st.class_id=$1 AND u.name ILIKE $2
         LIMIT 1`,
        [class_id, `%${providedName}%`]
      );

      if (matchRes.rows.length) {
        const stu = matchRes.rows[0];
        matchedStudentIds.add(stu.id);
        presentList.push({ student_id: stu.id, name: stu.name });
        const idx = unrecognizedNames.indexOf(providedName);
        if (idx !== -1) unrecognizedNames.splice(idx, 1);
      }
    }

    const absentList = [];

    // Mark all students present or absent
    for (const stu of allStudents.rows) {
      const status = matchedStudentIds.has(stu.id) ? 'present' : 'absent';
      await query(
        `INSERT INTO attendance_records (session_id, student_id, status)
         VALUES ($1,$2,$3)
         ON CONFLICT (session_id, student_id) DO UPDATE SET status=EXCLUDED.status`,
        [session_id, stu.id, status]
      );
      if (status === 'absent') absentList.push({ student_id: stu.id, name: stu.name });
    }

    // Fire-and-forget low attendance check
    checkAndNotifyLowAttendance(class_id);

    return sendSuccess(res, {
      session_id,
      matched: matchedStudentIds.size,
      unmatched: unrecognizedNames.length,
      present_list: presentList,
      absent_list: absentList,
      unrecognized_names: unrecognizedNames,
    }, 'Voice attendance processed');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance  — ?class_id=&date=
// ─────────────────────────────────────────────────────────────────────────────
const getAttendanceByClass = async (req, res, next) => {
  try {
    const { class_id, date = new Date().toISOString().split('T')[0] } = req.query;
    if (!class_id) return sendError(res, 'class_id required', 400);

    // Fetch session
    const sessRes = await query(
      `SELECT s.*, u.name AS marked_by_name
       FROM attendance_sessions s
       LEFT JOIN users u ON u.id=s.marked_by
       WHERE s.class_id=$1 AND s.date=$2 AND s.session_type='daily'`,
      [class_id, date]
    );
    const session = sessRes.rows[0] || null;

    // All students with their record (LEFT JOIN so unmarked show)
    const studentsRes = await query(
      `SELECT st.id AS student_id, st.roll_no, u.name, u.avatar_url,
              COALESCE(ar.status, 'unmarked') AS status, ar.remark
       FROM students st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN attendance_records ar
         ON ar.student_id=st.id AND ar.session_id=$1
       WHERE st.class_id=$2
       ORDER BY st.roll_no`,
      [session ? session.id : '00000000-0000-0000-0000-000000000000', class_id]
    );

    const records  = studentsRes.rows;
    const summary  = {
      present : records.filter(r => r.status === 'present').length,
      absent  : records.filter(r => r.status === 'absent').length,
      late    : records.filter(r => r.status === 'late').length,
      excused : records.filter(r => r.status === 'excused').length,
      unmarked: records.filter(r => r.status === 'unmarked').length,
      total   : records.length,
    };

    return sendSuccess(res, { date, class_id, session, summary, records });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/low  — ?threshold=75&class_id=
// ─────────────────────────────────────────────────────────────────────────────
const getLowAttendanceStudents = async (req, res, next) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 75;
    const school_id = req.user.school_id;
    const { class_id } = req.query;

    const conditions = ['st.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    if (class_id) { conditions.push(`st.class_id = $${idx++}`); params.push(class_id); }

    const where = conditions.join(' AND ');

    const result = await query(
      `SELECT
         st.id AS student_id,
         u.name AS student_name, u.email,
         c.name AS class_name, c.section,
         COUNT(ar.id) AS total_sessions,
         COUNT(ar.id) FILTER (WHERE ar.status IN ('present','late')) AS attended,
         ROUND(
           COUNT(ar.id) FILTER (WHERE ar.status IN ('present','late'))::numeric
           / NULLIF(COUNT(ar.id),0) * 100, 2
         ) AS attendance_pct,
         COUNT(ar.id) FILTER (WHERE ar.status='absent') AS days_absent,
         -- parent contact
         (SELECT string_agg(pu.phone, ', ')
          FROM student_parents sp JOIN users pu ON pu.id=sp.parent_id
          WHERE sp.student_id=st.id) AS parent_phones
       FROM students st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN classes c ON c.id=st.class_id
       LEFT JOIN attendance_records ar ON ar.student_id=st.id
       WHERE ${where}
       GROUP BY st.id, u.name, u.email, c.name, c.section
       HAVING ROUND(
         COUNT(ar.id) FILTER (WHERE ar.status IN ('present','late'))::numeric
         / NULLIF(COUNT(ar.id),0) * 100, 2
       ) < $${idx}
       ORDER BY attendance_pct ASC`,
      [...params, threshold]
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/stats/:class_id
// ─────────────────────────────────────────────────────────────────────────────
const getAttendanceStats = async (req, res, next) => {
  try {
    const { class_id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Today
    const todayRes = await query(
      `SELECT
         COUNT(*) FILTER (WHERE ar.status='present') AS present,
         COUNT(*) FILTER (WHERE ar.status='absent')  AS absent,
         COUNT(*) FILTER (WHERE ar.status='late')    AS late,
         COUNT(*) AS total
       FROM attendance_records ar
       JOIN attendance_sessions s ON s.id=ar.session_id
       WHERE s.class_id=$1 AND s.date=$2`,
      [class_id, today]
    );
    const t = todayRes.rows[0];
    const todayStats = {
      present: parseInt(t.present), absent: parseInt(t.absent),
      late: parseInt(t.late), total: parseInt(t.total),
      percentage: parseInt(t.total)
        ? parseFloat(((parseInt(t.present) + parseInt(t.late)) / parseInt(t.total) * 100).toFixed(2))
        : 0,
    };

    // This week
    const weekRes = await query(
      `SELECT
         ROUND(AVG(
           CASE WHEN day_total > 0
             THEN (day_present + day_late)::numeric / day_total * 100
             ELSE NULL END
         ), 2) AS avg_pct
       FROM (
         SELECT
           s.date,
           COUNT(*) FILTER (WHERE ar.status='present') AS day_present,
           COUNT(*) FILTER (WHERE ar.status='late')    AS day_late,
           COUNT(*) AS day_total
         FROM attendance_sessions s
         JOIN attendance_records ar ON ar.session_id=s.id
         WHERE s.class_id=$1
           AND s.date >= date_trunc('week', NOW())
         GROUP BY s.date
       ) sub`,
      [class_id]
    );

    // This month
    const monthRes = await query(
      `SELECT
         ROUND(AVG(day_pct),2) AS avg_pct,
         MIN(s.date) AS best_day_date, MAX(s.date) AS worst_day_date
       FROM (
         SELECT s.date,
           ROUND(
             COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric
             / NULLIF(COUNT(*),0)*100, 2
           ) AS day_pct
         FROM attendance_sessions s
         JOIN attendance_records ar ON ar.session_id=s.id
         WHERE s.class_id=$1
           AND EXTRACT(MONTH FROM s.date)=EXTRACT(MONTH FROM NOW())
           AND EXTRACT(YEAR FROM s.date)=EXTRACT(YEAR FROM NOW())
         GROUP BY s.date
       ) sub`,
      [class_id]
    );

    // Trend last 7 days
    const trendRes = await query(
      `SELECT s.date,
         ROUND(
           COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric
           / NULLIF(COUNT(*),0)*100, 2
         ) AS percentage
       FROM attendance_sessions s
       JOIN attendance_records ar ON ar.session_id=s.id
       WHERE s.class_id=$1 AND s.date >= NOW()-INTERVAL '7 days'
       GROUP BY s.date
       ORDER BY s.date`,
      [class_id]
    );

    // Per-student ranking
    const rankRes = await query(
      `SELECT u.name, st.roll_no,
         ROUND(
           COUNT(*) FILTER (WHERE ar.status IN ('present','late'))::numeric
           / NULLIF(COUNT(*),0)*100, 2
         ) AS percentage
       FROM students st
       JOIN users u ON u.id=st.user_id
       JOIN attendance_records ar ON ar.student_id=st.id
       JOIN attendance_sessions s ON s.id=ar.session_id AND s.class_id=$1
       WHERE st.class_id=$1
       GROUP BY st.id, u.name, st.roll_no
       ORDER BY percentage ASC`,
      [class_id]
    );

    return sendSuccess(res, {
      today: todayStats,
      this_week: { avg_percentage: parseFloat(weekRes.rows[0].avg_pct) || 0 },
      this_month: {
        avg_percentage : parseFloat(monthRes.rows[0].avg_pct) || 0,
        best_day       : monthRes.rows[0].best_day_date,
        worst_day      : monthRes.rows[0].worst_day_date,
      },
      trend_last_7_days: trendRes.rows,
      per_student_ranking: rankRes.rows,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/attendance/records/:id  — correct a single record
// ─────────────────────────────────────────────────────────────────────────────
const updateAttendanceRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    // Auth: only teacher who marked session or admin
    const recRes = await query(
      `SELECT ar.*, s.marked_by FROM attendance_records ar
       JOIN attendance_sessions s ON s.id=ar.session_id
       WHERE ar.id=$1`,
      [id]
    );
    if (!recRes.rows.length) return sendError(res, 'Record not found', 404);

    const rec = recRes.rows[0];
    if (req.user.role !== 'admin' && rec.marked_by !== req.user.id) {
      return sendError(res, 'Only the teacher who marked this session or an admin can edit records', 403);
    }

    const result = await query(
      `UPDATE attendance_records SET status=$1, remark=$2 WHERE id=$3 RETURNING *`,
      [status, remark || null, id]
    );

    return sendSuccess(res, result.rows[0], 'Attendance record updated');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/live/:class_id
// ─────────────────────────────────────────────────────────────────────────────
const getLiveAttendance = async (req, res, next) => {
  try {
    const { class_id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const sessRes = await query(
      `SELECT s.*, u.name AS marked_by_name
       FROM attendance_sessions s
       LEFT JOIN users u ON u.id=s.marked_by
       WHERE s.class_id=$1 AND s.date=$2 AND s.session_type='daily'`,
      [class_id, today]
    );
    const session = sessRes.rows[0] || null;

    const studentsRes = await query(
      `SELECT st.id AS student_id, st.roll_no, u.name, u.avatar_url,
              COALESCE(ar.status, 'unmarked') AS status,
              ar.remark, ar.created_at AS marked_at
       FROM students st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN attendance_records ar
         ON ar.student_id=st.id
        AND ar.session_id=$1
       WHERE st.class_id=$2
       ORDER BY st.roll_no`,
      [session ? session.id : '00000000-0000-0000-0000-000000000000', class_id]
    );

    const records = studentsRes.rows;
    const lastUpdate = records.reduce((latest, r) => {
      if (!r.marked_at) return latest;
      return !latest || new Date(r.marked_at) > new Date(latest) ? r.marked_at : latest;
    }, null);

    return sendSuccess(res, {
      date: today,
      class_id,
      session,
      last_update: lastUpdate,
      marked_by: session?.marked_by_name || null,
      summary: {
        present : records.filter(r => r.status === 'present').length,
        absent  : records.filter(r => r.status === 'absent').length,
        late    : records.filter(r => r.status === 'late').length,
        unmarked: records.filter(r => r.status === 'unmarked').length,
        total   : records.length,
      },
      records,
    });
  } catch (err) { next(err); }
};

module.exports = {
  startSession,
  markAttendance,
  generateQRToken,
  scanQRToken,
  voiceAttendance,
  getAttendanceByClass,
  getLowAttendanceStudents,
  getAttendanceStats,
  updateAttendanceRecord,
  getLiveAttendance,
  checkAndNotifyLowAttendance,
};
