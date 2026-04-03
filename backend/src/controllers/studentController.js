'use strict';

const bcrypt = require('bcryptjs');
const { pool, query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students
// ─────────────────────────────────────────────────────────────────────────────
const getAllStudents = async (req, res, next) => {
  try {
    const { class_id, search } = req.query;
    const { page, limit, offset } = req.pagination;
    const school_id = req.user.school_id;
    const role = req.user.role;

    const conditions = ['st.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    // ── Role-based scoping ────────────────────────────────────────────────────
    if (role === 'teacher') {
      // Students in classes where this teacher is class_teacher OR teaches via class_subjects
      conditions.push(`(
        st.class_id IN (SELECT id FROM classes WHERE class_teacher_id = $${idx++})
        OR
        st.class_id IN (SELECT class_id FROM class_subjects WHERE teacher_id = $${idx++})
      )`);
      params.push(req.user.id, req.user.id);
    } else if (role === 'parent') {
      conditions.push(`st.id IN (SELECT student_id FROM student_parents WHERE parent_id = $${idx++})`);
      params.push(req.user.id);
    } else if (role === 'student') {
      conditions.push(`st.user_id = $${idx++}`);
      params.push(req.user.id);
    }
    // admin: no extra scope

    if (class_id) { conditions.push(`st.class_id = $${idx++}`); params.push(class_id); }
    if (search)   { conditions.push(`u.name ILIKE $${idx++}`);   params.push(`%${search}%`); }

    const where = conditions.join(' AND ');

    const countRes = await query(
      `SELECT COUNT(DISTINCT st.id)
       FROM students st
       JOIN users u ON u.id = st.user_id
       WHERE ${where}`,
      params
    );

    const dataRes = await query(
      `SELECT st.id, st.roll_no, st.admission_no,
              u.name, u.avatar_url, u.email,
              c.id AS class_id, c.name AS class_name, c.section
       FROM students st
       JOIN users u ON u.id = st.user_id
       LEFT JOIN classes c ON c.id = st.class_id
       WHERE ${where}
       ORDER BY c.name, c.section, st.roll_no
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    // Reshape
    const data = dataRes.rows.map(r => ({
      id: r.id,
      roll_no: r.roll_no,
      admission_no: r.admission_no,
      user: { name: r.name, avatar_url: r.avatar_url, email: r.email },
      class: { id: r.class_id, name: r.class_name, section: r.section },
    }));

    return sendPaginated(res, data, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students/:id  — 360 profile
// ─────────────────────────────────────────────────────────────────────────────
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ── Core student + user + class ──────────────────────────────────────────
    const coreRes = await query(
      `SELECT
         st.id, st.roll_no, st.admission_no, st.dob, st.gender, st.blood_group, st.address,
         u.name, u.email, u.phone, u.avatar_url,
         c.id AS class_id, c.name AS class_name, c.section,
         ct.name AS class_teacher_name
       FROM students st
       JOIN users u ON u.id = st.user_id
       LEFT JOIN classes c ON c.id = st.class_id
       LEFT JOIN users ct ON ct.id = c.class_teacher_id
       WHERE st.id = $1`,
      [id]
    );
    if (!coreRes.rows.length) return sendError(res, 'Student not found', 404);
    const core = coreRes.rows[0];

    // ── Attendance summary (CTE) ──────────────────────────────────────────────
    const attRes = await query(
      `WITH att_summary AS (
         SELECT
           COUNT(*) FILTER (WHERE ar.status = 'present')  AS present,
           COUNT(*) FILTER (WHERE ar.status = 'absent')   AS absent,
           COUNT(*) FILTER (WHERE ar.status = 'late')     AS late,
           COUNT(*) FILTER (WHERE ar.status = 'excused')  AS excused,
           COUNT(*) AS total
         FROM attendance_records ar
         JOIN attendance_sessions s ON ar.session_id = s.id
         WHERE ar.student_id = $1
       )
       SELECT *, CASE WHEN total > 0
         THEN ROUND(((present + late)::numeric / total) * 100, 2)
         ELSE 0 END AS percentage
       FROM att_summary`,
      [id]
    );

    // ── Parents list ──────────────────────────────────────────────────────────
    const parentsRes = await query(
      `SELECT sp.relation, sp.is_primary, u.id AS user_id, u.name, u.phone, u.email
       FROM student_parents sp
       JOIN users u ON u.id = sp.parent_id
       WHERE sp.student_id = $1`,
      [id]
    );

    // ── Recent marks (last 3 exams) ───────────────────────────────────────────
    const marksRes = await query(
      `SELECT e.name AS exam_name, s.name AS subject_name,
              m.score, es.max_marks, m.grade
       FROM marks m
       JOIN exam_subjects es ON es.id = m.exam_subject_id
       JOIN exams e ON e.id = es.exam_id
       JOIN subjects s ON s.id = es.subject_id
       WHERE m.student_id = $1
       ORDER BY e.start_date DESC
       LIMIT 9`,
      [id]
    );

    // ── Pending assignments ────────────────────────────────────────────────────
    const pendingRes = await query(
      `SELECT a.id, a.title, a.due_date, s.name AS subject_name
       FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       WHERE cs.class_id = $1
         AND a.due_date > NOW()
         AND a.id NOT IN (
           SELECT assignment_id FROM assignment_submissions WHERE student_id = $2
         )
       ORDER BY a.due_date
       LIMIT 5`,
      [core.class_id, id]
    );

    // ── Fee status ─────────────────────────────────────────────────────────────
    const feeRes = await query(
      `SELECT
         COUNT(*) FILTER (WHERE fp.status = 'paid')    AS paid,
         COUNT(*) FILTER (WHERE fp.status = 'pending') AS pending,
         COUNT(*) AS total
       FROM fee_payments fp
       WHERE fp.student_id = $1`,
      [id]
    );

    const att = attRes.rows[0];

    return sendSuccess(res, {
      student: {
        id: core.id, roll_no: core.roll_no, admission_no: core.admission_no,
        dob: core.dob, gender: core.gender, blood_group: core.blood_group, address: core.address,
      },
      user: { name: core.name, email: core.email, phone: core.phone, avatar_url: core.avatar_url },
      class: {
        id: core.class_id, name: core.class_name, section: core.section,
        class_teacher_name: core.class_teacher_name,
      },
      parents: parentsRes.rows,
      attendance_summary: {
        present: parseInt(att.present), absent: parseInt(att.absent),
        late: parseInt(att.late), excused: parseInt(att.excused),
        total: parseInt(att.total), percentage: parseFloat(att.percentage),
      },
      recent_marks: marksRes.rows,
      pending_assignments: pendingRes.rows,
      fee_status: {
        paid: parseInt(feeRes.rows[0].paid),
        pending: parseInt(feeRes.rows[0].pending),
        total: parseInt(feeRes.rows[0].total),
      },
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/students  — create user + student in transaction
// ─────────────────────────────────────────────────────────────────────────────
const createStudent = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      name, email, password,
      roll_no, class_id, dob = null, gender = null,
      admission_no = null, blood_group = null, address = null,
      parent_id = null, relation = 'parent',
    } = req.body;
    const school_id = req.user.school_id;

    await client.query('BEGIN');

    const password_hash = await bcrypt.hash(password || 'Klasso@123', SALT_ROUNDS);

    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, school_id)
       VALUES ($1,$2,$3,'student',$4) RETURNING id, name, email`,
      [name, email.toLowerCase(), password_hash, school_id]
    );
    const newUser = userRes.rows[0];

    const stuRes = await client.query(
      `INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender, blood_group, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [newUser.id, school_id, class_id, roll_no, admission_no, dob, gender, blood_group, address]
    );
    const student = stuRes.rows[0];

    if (parent_id) {
      await client.query(
        `INSERT INTO student_parents (student_id, parent_id, relation, is_primary)
         VALUES ($1,$2,$3,true) ON CONFLICT DO NOTHING`,
        [student.id, parent_id, relation]
      );
    }

    await client.query('COMMIT');
    return sendSuccess(res, { user: newUser, student }, 'Student created successfully', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/students/:id  — update both users + students tables
// ─────────────────────────────────────────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Find user_id
    const stuCheck = await client.query('SELECT user_id FROM students WHERE id=$1', [id]);
    if (!stuCheck.rows.length) return sendError(res, 'Student not found', 404);
    const user_id = stuCheck.rows[0].user_id;

    await client.query('BEGIN');

    // ── Update users table ─────────────────────────────────────────────────
    const userFields = ['name', 'phone', 'avatar_url'];
    const userUpdates = []; const userParams = []; let ui = 1;
    for (const f of userFields) {
      if (req.body[f] !== undefined) { userUpdates.push(`${f}=$${ui++}`); userParams.push(req.body[f]); }
    }
    if (userUpdates.length) {
      userParams.push(user_id);
      await client.query(`UPDATE users SET ${userUpdates.join(',')} WHERE id=$${ui}`, userParams);
    }

    // ── Update students table ──────────────────────────────────────────────
    const stuFields = ['class_id','roll_no','admission_no','dob','gender','blood_group','address'];
    const stuUpdates = []; const stuParams = []; let si = 1;
    for (const f of stuFields) {
      if (req.body[f] !== undefined) { stuUpdates.push(`${f}=$${si++}`); stuParams.push(req.body[f]); }
    }
    let updatedStudent = null;
    if (stuUpdates.length) {
      stuParams.push(id);
      const r = await client.query(
        `UPDATE students SET ${stuUpdates.join(',')} WHERE id=$${si} RETURNING *`, stuParams
      );
      updatedStudent = r.rows[0];
    }

    await client.query('COMMIT');
    return sendSuccess(res, updatedStudent || { message: 'No student fields changed' }, 'Student updated successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/students/:id  — soft delete
// ─────────────────────────────────────────────────────────────────────────────
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stuRes = await query('SELECT user_id, roll_no FROM students WHERE id=$1', [id]);
    if (!stuRes.rows.length) return sendError(res, 'Student not found', 404);
    const { user_id, roll_no } = stuRes.rows[0];
    await query('UPDATE users SET is_active=false WHERE id=$1', [user_id]);
    return sendSuccess(res, { id, roll_no }, 'Student deactivated successfully');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/students/bulk-import  — CSV upload
// ─────────────────────────────────────────────────────────────────────────────
const bulkImportStudents = async (req, res, next) => {
  const client = await pool.connect();
  try {
    if (!req.file) return sendError(res, 'CSV file required', 400);
    const school_id = req.user.school_id;

    // Parse CSV from buffer
    const csv = req.file.buffer.toString('utf-8');
    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    const imported = [];
    const failed = [];

    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      const values = rows[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, j) => { row[h] = values[j] || null; });

      try {
        // Required fields check
        if (!row.name || !row.email || !row.roll_no || !row.class_id) {
          failed.push({ line: i + 2, reason: 'Missing required fields', data: row });
          continue;
        }

        const password_hash = await bcrypt.hash('Klasso@123', SALT_ROUNDS);

        const uRes = await client.query(
          `INSERT INTO users (name, email, password_hash, role, school_id)
           VALUES ($1,$2,$3,'student',$4)
           ON CONFLICT (email) DO NOTHING
           RETURNING id`,
          [row.name, row.email.toLowerCase(), password_hash, school_id]
        );

        if (!uRes.rows.length) {
          failed.push({ line: i + 2, reason: 'Email already exists', data: row });
          continue;
        }

        const sRes = await client.query(
          `INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [uRes.rows[0].id, school_id, row.class_id, row.roll_no,
           row.admission_no || null, row.dob || null, row.gender || null]
        );

        if (sRes.rows.length) {
          imported.push({ name: row.name, email: row.email, student_id: sRes.rows[0].id });
        } else {
          failed.push({ line: i + 2, reason: 'Duplicate roll_no in class', data: row });
        }
      } catch (rowErr) {
        failed.push({ line: i + 2, reason: rowErr.message, data: row });
      }
    }

    await client.query('COMMIT');
    return sendSuccess(res, {
      imported: imported.length,
      failed: failed.length,
      imported_students: imported,
      errors: failed,
    }, `Imported ${imported.length} students, ${failed.length} failed`, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students/:id/attendance  — calendar view ?month=&year=
// ─────────────────────────────────────────────────────────────────────────────
const getStudentAttendanceCalendar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const stuRes = await query(
      `SELECT u.name FROM students st JOIN users u ON u.id=st.user_id WHERE st.id=$1`, [id]
    );
    if (!stuRes.rows.length) return sendError(res, 'Student not found', 404);

    const recordsRes = await query(
      `SELECT s.date, ar.status, ar.remark
       FROM attendance_records ar
       JOIN attendance_sessions s ON s.id = ar.session_id
       WHERE ar.student_id = $1
         AND EXTRACT(MONTH FROM s.date) = $2
         AND EXTRACT(YEAR FROM s.date)  = $3
       ORDER BY s.date`,
      [id, month, year]
    );

    const records = recordsRes.rows;
    const present = records.filter(r => r.status === 'present').length;
    const absent  = records.filter(r => r.status === 'absent').length;
    const late    = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const total   = records.length;

    return sendSuccess(res, {
      student: stuRes.rows[0],
      month, year,
      summary: {
        present, absent, late, excused, total,
        percentage: total ? parseFloat(((present + late) / total * 100).toFixed(2)) : 0,
      },
      calendar: records.map(r => ({
        date: r.date, status: r.status, remark: r.remark,
      })),
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students/:id/marks
// ─────────────────────────────────────────────────────────────────────────────
const getStudentMarks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT e.name AS exam_name, e.exam_type, e.start_date,
              s.name AS subject_name, s.code AS subject_code,
              m.score, es.max_marks, es.passing_marks, m.grade, m.remarks
       FROM marks m
       JOIN exam_subjects es ON es.id = m.exam_subject_id
       JOIN exams e ON e.id = es.exam_id
       JOIN subjects s ON s.id = es.subject_id
       WHERE m.student_id = $1
       ORDER BY e.start_date DESC, s.name`,
      [id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students/:id/assignments
// ─────────────────────────────────────────────────────────────────────────────
const getStudentAssignments = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find class_id
    const stuRes = await query('SELECT class_id FROM students WHERE id=$1', [id]);
    if (!stuRes.rows.length) return sendError(res, 'Student not found', 404);
    const class_id = stuRes.rows[0].class_id;

    const result = await query(
      `SELECT a.id, a.title, a.description, a.due_date, a.max_marks, a.attachment_url,
              s.name AS subject_name,
              sub.id AS submission_id, sub.status AS submission_status,
              sub.score, sub.submitted_at
       FROM assignments a
       JOIN class_subjects cs ON cs.id = a.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN assignment_submissions sub
         ON sub.assignment_id = a.id AND sub.student_id = $1
       WHERE cs.class_id = $2
       ORDER BY a.due_date DESC`,
      [id, class_id]
    );

    const pending   = result.rows.filter(r => !r.submission_id && new Date(r.due_date) > new Date());
    const submitted = result.rows.filter(r => r.submission_id);
    const missed    = result.rows.filter(r => !r.submission_id && new Date(r.due_date) <= new Date());

    return sendSuccess(res, { all: result.rows, pending, submitted, missed });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students/:id/timetable  — today + weekly
// ─────────────────────────────────────────────────────────────────────────────
const getStudentTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stuRes = await query('SELECT class_id FROM students WHERE id=$1', [id]);
    if (!stuRes.rows.length) return sendError(res, 'Student not found', 404);
    const class_id = stuRes.rows[0].class_id;

    const allSlots = await query(
      `SELECT ts.day_of_week, ts.period_number, ts.start_time, ts.end_time, ts.room,
              s.name AS subject_name, s.code AS subject_code,
              u.name AS teacher_name
       FROM timetable_slots ts
       JOIN class_subjects cs ON cs.id = ts.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN users u ON u.id = cs.teacher_id
       WHERE ts.class_id = $1
       ORDER BY ts.day_of_week, ts.period_number`,
      [class_id]
    );

    // JS day 0=Sun, 1=Mon…  DB day_of_week 1=Mon…6=Sat
    const jsDay = new Date().getDay();
    const todayDbDay = jsDay === 0 ? null : jsDay; // Sunday = no school

    const today  = todayDbDay ? allSlots.rows.filter(s => s.day_of_week === todayDbDay) : [];
    const weekly = allSlots.rows.reduce((acc, s) => {
      const d = s.day_of_week;
      if (!acc[d]) acc[d] = [];
      acc[d].push(s);
      return acc;
    }, {});

    return sendSuccess(res, { today, weekly });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/students/my/profile  — student views own profile
// ─────────────────────────────────────────────────────────────────────────────
const getMyProfile = async (req, res, next) => {
  try {
    const stuRes = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!stuRes.rows.length) return sendError(res, 'Student profile not found for this account', 404);
    req.params.id = stuRes.rows[0].id;
    return getStudentById(req, res, next);
  } catch (err) { next(err); }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  getStudentAttendanceCalendar,
  getStudentMarks,
  getStudentAssignments,
  getStudentTimetable,
  getMyProfile,
};
