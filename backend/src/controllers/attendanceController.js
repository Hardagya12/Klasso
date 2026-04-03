'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotificationsForMany } = require('../utils/notificationHelper');

// ── POST /api/attendance/session  ────────────────────────────────────────────
// Create a session + bulk-insert records
const markAttendance = async (req, res, next) => {
  try {
    const { class_id, date, session_type = 'daily', class_subject_id = null, records } = req.body;
    // records = [{ student_id, status, remark }]

    // Upsert session
    const sessionRes = await query(
      `INSERT INTO attendance_sessions (class_id, class_subject_id, date, session_type, marked_by)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (class_id, date, session_type) DO UPDATE
         SET marked_by = EXCLUDED.marked_by
       RETURNING *`,
      [class_id, class_subject_id, date, session_type, req.user.id]
    );
    const session = sessionRes.rows[0];

    // Upsert each record
    for (const r of records) {
      await query(
        `INSERT INTO attendance_records (session_id, student_id, status, remark)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (session_id, student_id) DO UPDATE
           SET status=EXCLUDED.status, remark=EXCLUDED.remark`,
        [session.id, r.student_id, r.status, r.remark || null]
      );
    }

    // Notify absent students' parents
    const absentIds = records.filter(r => r.status === 'absent').map(r => r.student_id);
    if (absentIds.length) {
      // Find parent user_ids for absent students
      if (absentIds.length > 0) {
        const placeholders = absentIds.map((_, i) => `$${i + 1}`).join(',');
        const parentRes = await query(
          `SELECT sp.parent_id FROM student_parents sp WHERE sp.student_id IN (${placeholders})`,
          absentIds
        );
        const parentUserIds = parentRes.rows.map(r => r.parent_id);
        if (parentUserIds.length) {
          await createNotificationsForMany(
            parentUserIds,
            'Attendance Alert',
            `Your child was marked absent on ${date}.`,
            'warning', 'attendance', session.id
          );
        }
      }
    }

    return sendSuccess(res, { session, records_count: records.length }, 'Attendance marked successfully', 201);
  } catch (err) { next(err); }
};

// ── GET /api/attendance/session  ─────────────────────────────────────────────
// Query: class_id + date (+ session_type optional)
const getSessionAttendance = async (req, res, next) => {
  try {
    const { class_id, date, session_type = 'daily' } = req.query;

    const sessionRes = await query(
      'SELECT * FROM attendance_sessions WHERE class_id=$1 AND date=$2 AND session_type=$3',
      [class_id, date, session_type]
    );
    if (!sessionRes.rows.length) return sendError(res, 'Session not found', 404);
    const session = sessionRes.rows[0];

    const records = await query(
      `SELECT ar.id, ar.status, ar.remark, ar.created_at,
              st.id AS student_id, st.roll_no, u.name AS student_name
       FROM attendance_records ar
       JOIN students st ON st.id = ar.student_id
       JOIN users u ON u.id = st.user_id
       WHERE ar.session_id = $1
       ORDER BY st.roll_no`,
      [session.id]
    );

    return sendSuccess(res, { session, records: records.rows });
  } catch (err) { next(err); }
};

// ── GET /api/attendance/student/:studentId  ───────────────────────────────────
// Attendance summary + daily records for a student
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { from, to, class_id } = req.query;

    const conditions = ['ar.student_id = $1'];
    const params = [studentId];
    let idx = 2;

    if (from)     { conditions.push(`s.date >= $${idx++}`); params.push(from); }
    if (to)       { conditions.push(`s.date <= $${idx++}`); params.push(to); }
    if (class_id) { conditions.push(`s.class_id = $${idx++}`); params.push(class_id); }

    const where = conditions.join(' AND ');

    const records = await query(
      `SELECT ar.status, s.date, s.session_type
       FROM attendance_records ar
       JOIN attendance_sessions s ON s.id = ar.session_id
       WHERE ${where}
       ORDER BY s.date DESC`,
      params
    );

    const total   = records.rows.length;
    const present = records.rows.filter(r => r.status === 'present').length;
    const absent  = records.rows.filter(r => r.status === 'absent').length;
    const late    = records.rows.filter(r => r.status === 'late').length;

    return sendSuccess(res, {
      summary: { total, present, absent, late, percentage: total ? +((present / total) * 100).toFixed(2) : 0 },
      records: records.rows,
    });
  } catch (err) { next(err); }
};

// ── GET /api/attendance/class/:classId/summary  ───────────────────────────────
const getClassAttendanceSummary = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { from, to } = req.query;

    const conditions = ['s.class_id = $1'];
    const params = [classId];
    let idx = 2;
    if (from) { conditions.push(`s.date >= $${idx++}`); params.push(from); }
    if (to)   { conditions.push(`s.date <= $${idx++}`); params.push(to); }
    const where = conditions.join(' AND ');

    const result = await query(
      `SELECT st.id AS student_id, u.name AS student_name, st.roll_no,
              COUNT(*) FILTER (WHERE ar.status='present') AS present,
              COUNT(*) FILTER (WHERE ar.status='absent')  AS absent,
              COUNT(*) FILTER (WHERE ar.status='late')    AS late,
              COUNT(*) AS total
       FROM attendance_records ar
       JOIN attendance_sessions s ON s.id = ar.session_id
       JOIN students st ON st.id = ar.student_id
       JOIN users u ON u.id = st.user_id
       WHERE ${where}
       GROUP BY st.id, u.name, st.roll_no
       ORDER BY st.roll_no`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ── POST /api/attendance/qr-session  ─────────────────────────────────────────
const createQRSession = async (req, res, next) => {
  try {
    const { class_id, expires_minutes = 10 } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const token = uuidv4();
    const expires_at = new Date(Date.now() + expires_minutes * 60000).toISOString();

    // Create session first
    const sessionRes = await query(
      `INSERT INTO attendance_sessions (class_id, date, session_type, marked_by)
       VALUES ($1, CURRENT_DATE, 'daily', $2)
       ON CONFLICT (class_id, CURRENT_DATE, 'daily') DO UPDATE SET marked_by=EXCLUDED.marked_by
       RETURNING *`,
      [class_id, req.user.id]
    );

    const session = sessionRes.rows[0];
    const qrRes = await query(
      `INSERT INTO qr_tokens (class_id, token, session_id, expires_at)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [class_id, token, session.id, expires_at]
    );

    return sendSuccess(res, { qr_token: qrRes.rows[0], session }, 'QR session created', 201);
  } catch (err) { next(err); }
};

// ── POST /api/attendance/qr-mark  ────────────────────────────────────────────
// Student scans QR to self-mark present
const markViaQR = async (req, res, next) => {
  try {
    const { token } = req.body;

    const tokenRes = await query(
      'SELECT * FROM qr_tokens WHERE token=$1 AND expires_at > NOW()',
      [token]
    );
    if (!tokenRes.rows.length) return sendError(res, 'QR token is invalid or has expired', 400);
    const qr = tokenRes.rows[0];

    // Resolve student record
    const studentRes = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!studentRes.rows.length) return sendError(res, 'Student record not found for this user', 404);
    const student_id = studentRes.rows[0].id;

    await query(
      `INSERT INTO attendance_records (session_id, student_id, status)
       VALUES ($1,$2,'present')
       ON CONFLICT (session_id, student_id) DO NOTHING`,
      [qr.session_id, student_id]
    );

    return sendSuccess(res, null, 'Attendance marked as present via QR');
  } catch (err) { next(err); }
};

module.exports = {
  markAttendance, getSessionAttendance,
  getStudentAttendance, getClassAttendanceSummary,
  createQRSession, markViaQR,
};
