'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── GET /api/classes ───────────────────────────────────────────────────────────
const getAllClasses = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const school_id = req.user.school_id;

    let baseQuery;
    let params;

    if (req.user.role === 'teacher') {
      // Teachers see only classes they teach in (via class_subjects)
      baseQuery = `
        FROM classes cl
        JOIN class_subjects cs ON cs.class_id = cl.id
        LEFT JOIN users ct ON ct.id = cl.class_teacher_id
        WHERE cl.school_id = $1 AND cs.teacher_id = $2
      `;
      params = [school_id, req.user.id];
    } else {
      baseQuery = `
        FROM classes cl
        LEFT JOIN users ct ON ct.id = cl.class_teacher_id
        WHERE cl.school_id = $1
      `;
      params = [school_id];
    }

    const countResult = await query(`SELECT COUNT(DISTINCT cl.id) ${baseQuery}`, params);

    const dataResult = await query(
      `SELECT DISTINCT cl.id, cl.name, cl.section, cl.room_number, cl.academic_year_id,
              ct.name AS class_teacher_name, ct.id AS class_teacher_id,
              (SELECT COUNT(*) FROM students s WHERE s.class_id = cl.id) AS student_count
       ${baseQuery}
       ORDER BY cl.name, cl.section
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataResult.rows, parseInt(countResult.rows[0].count), req.pagination);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/classes/:id ───────────────────────────────────────────────────────
const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const result = await query(
      `SELECT cl.*, ct.name AS class_teacher_name, ct.email AS class_teacher_email,
              (SELECT COUNT(*) FROM students s WHERE s.class_id = cl.id) AS student_count
       FROM classes cl
       LEFT JOIN users ct ON ct.id = cl.class_teacher_id
       WHERE cl.id = $1 AND cl.school_id = $2`,
      [id, school_id]
    );

    if (!result.rows.length) return sendError(res, 'Class not found', 404);

    const classData = result.rows[0];

    // Fetch subjects list
    const subjectsResult = await query(
      `SELECT cs.id AS class_subject_id, cs.periods_per_week,
              s.id AS subject_id, s.name AS subject_name, s.code AS subject_code,
              u.id AS teacher_id, u.name AS teacher_name
       FROM class_subjects cs
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN users u ON u.id = cs.teacher_id
       WHERE cs.class_id = $1`,
      [id]
    );

    classData.subjects = subjectsResult.rows;

    return sendSuccess(res, classData);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/classes ──────────────────────────────────────────────────────────
const createClass = async (req, res, next) => {
  try {
    const { name, section, class_teacher_id = null, room_number = null, academic_year_id = null } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [school_id, academic_year_id, name, section, class_teacher_id, room_number]
    );

    return sendSuccess(res, result.rows[0], 'Class created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/classes/:id ───────────────────────────────────────────────────────
const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'section', 'class_teacher_id', 'room_number', 'academic_year_id'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) return sendError(res, 'No fields to update', 400);

    params.push(id);
    const result = await query(
      `UPDATE classes SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (!result.rows.length) return sendError(res, 'Class not found', 404);

    return sendSuccess(res, result.rows[0], 'Class updated successfully');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/classes/:id ────────────────────────────────────────────────────
const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const studentCheck = await query('SELECT COUNT(*) FROM students WHERE class_id = $1', [id]);
    if (parseInt(studentCheck.rows[0].count) > 0) {
      return sendError(res, 'Cannot delete class with enrolled students. Remove students first.', 400);
    }

    const result = await query('DELETE FROM classes WHERE id = $1 RETURNING id, name, section', [id]);
    if (!result.rows.length) return sendError(res, 'Class not found', 404);

    return sendSuccess(res, result.rows[0], 'Class deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/classes/:id/students ─────────────────────────────────────────────
const getClassStudents = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT st.id, st.roll_no, st.admission_no, st.dob, st.gender, st.blood_group,
              u.name, u.email, u.phone, u.avatar_url
       FROM students st
       JOIN users u ON u.id = st.user_id
       WHERE st.class_id = $1
       ORDER BY st.roll_no`,
      [id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/classes/:id/subjects ─────────────────────────────────────────────
const getClassSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT cs.id AS class_subject_id, cs.periods_per_week,
              s.id AS subject_id, s.name AS subject_name, s.code AS subject_code,
              u.id AS teacher_id, u.name AS teacher_name, u.email AS teacher_email
       FROM class_subjects cs
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN users u ON u.id = cs.teacher_id
       WHERE cs.class_id = $1
       ORDER BY s.name`,
      [id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/classes/:id/subjects ────────────────────────────────────────────
const assignSubject = async (req, res, next) => {
  try {
    const { id: class_id } = req.params;
    const { subject_id, teacher_id = null, periods_per_week = 5 } = req.body;

    const result = await query(
      `INSERT INTO class_subjects (class_id, subject_id, teacher_id, periods_per_week)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (class_id, subject_id) DO UPDATE
         SET teacher_id = EXCLUDED.teacher_id,
             periods_per_week = EXCLUDED.periods_per_week
       RETURNING *`,
      [class_id, subject_id, teacher_id, periods_per_week]
    );

    return sendSuccess(res, result.rows[0], 'Subject assigned to class successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/classes/:classId/subjects/:subjectId ──────────────────────────
const removeSubject = async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;

    const result = await query(
      `DELETE FROM class_subjects WHERE class_id = $1 AND subject_id = $2
       RETURNING *`,
      [classId, subjectId]
    );

    if (!result.rows.length) {
      return sendError(res, 'Subject assignment not found for this class', 404);
    }

    return sendSuccess(res, result.rows[0], 'Subject removed from class successfully');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/classes/:id/timetable ────────────────────────────────────────────
const getClassTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT ts.id, ts.day_of_week, ts.period_number, ts.start_time, ts.end_time, ts.room,
              s.name AS subject_name, s.code AS subject_code,
              u.name AS teacher_name
       FROM timetable_slots ts
       JOIN class_subjects cs ON cs.id = ts.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       LEFT JOIN users u ON u.id = cs.teacher_id
       WHERE ts.class_id = $1
       ORDER BY ts.day_of_week, ts.period_number`,
      [id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getClassSubjects,
  assignSubject,
  removeSubject,
  getClassTimetable,
};
