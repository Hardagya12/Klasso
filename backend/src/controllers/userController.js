'use strict';

const bcrypt = require('bcryptjs');
const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const SALT_ROUNDS = 12;

const sanitizeUser = (user) => {
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
};

// ── GET /api/users ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { role, school_id } = req.query;
    const { page, limit, offset } = req.pagination;

    const conditions = [];
    const params = [];
    let idx = 1;

    // Admins can filter; scope to their own school by default
    const scopedSchool = school_id || req.user.school_id;
    if (scopedSchool) {
      conditions.push(`school_id = $${idx++}`);
      params.push(scopedSchool);
    }
    if (role) {
      conditions.push(`role = $${idx++}`);
      params.push(role);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${where}`,
      params
    );

    const dataResult = await query(
      `SELECT id, name, email, role, school_id, phone, avatar_url, is_active, last_login, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataResult.rows, parseInt(countResult.rows[0].count), req.pagination);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      `SELECT id, name, email, role, school_id, phone, avatar_url, is_active, last_login, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (!userResult.rows.length) return sendError(res, 'User not found', 404);

    const user = userResult.rows[0];

    // Role-specific enrichment
    if (user.role === 'teacher') {
      const csResult = await query(
        `SELECT cs.id, cs.periods_per_week,
                c.name AS class_name, c.section,
                s.name AS subject_name, s.code AS subject_code
         FROM class_subjects cs
         JOIN classes c ON c.id = cs.class_id
         JOIN subjects s ON s.id = cs.subject_id
         WHERE cs.teacher_id = $1`,
        [id]
      );
      user.class_subjects = csResult.rows;
    }

    if (user.role === 'parent') {
      const childrenResult = await query(
        `SELECT st.id, st.roll_no, st.admission_no,
                u.name AS student_name, u.email AS student_email,
                c.name AS class_name, c.section,
                sp.relation
         FROM student_parents sp
         JOIN students st ON st.id = sp.student_id
         JOIN users u ON u.id = st.user_id
         JOIN classes c ON c.id = st.class_id
         WHERE sp.parent_id = $1`,
        [id]
      );
      user.children = childrenResult.rows;
    }

    return sendSuccess(res, sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users ────────────────────────────────────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const {
      name, email, password, role,
      school_id, phone, avatar_url,
      // Teacher-specific optional
      class_subjects: csAssignments,
    } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return sendError(res, 'Email already registered', 409);

    const password_hash = await bcrypt.hash(password || 'Klasso@123', SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, school_id, phone, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, school_id, phone, avatar_url, is_active, created_at`,
      [name, email.toLowerCase(), password_hash, role, school_id || req.user.school_id, phone || null, avatar_url || null]
    );

    const newUser = result.rows[0];

    // Optionally assign teacher to class_subjects
    if (role === 'teacher' && Array.isArray(csAssignments) && csAssignments.length > 0) {
      for (const cs of csAssignments) {
        await query(
          `INSERT INTO class_subjects (class_id, subject_id, teacher_id, periods_per_week)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (class_id, subject_id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id`,
          [cs.class_id, cs.subject_id, newUser.id, cs.periods_per_week || 5]
        );
      }
    }

    return sendSuccess(res, newUser, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/:id ─────────────────────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'email', 'role', 'school_id', 'phone', 'avatar_url', 'is_active'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) return sendError(res, 'No valid fields to update', 400);

    params.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, school_id, phone, avatar_url, is_active, last_login, created_at`,
      params
    );

    if (!result.rows.length) return sendError(res, 'User not found', 404);

    return sendSuccess(res, result.rows[0], 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/:id (soft delete) ────────────────────────────────────────
const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE users SET is_active = FALSE WHERE id = $1
       RETURNING id, name, email, is_active`,
      [id]
    );

    if (!result.rows.length) return sendError(res, 'User not found', 404);

    return sendSuccess(res, result.rows[0], 'User deactivated successfully');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/teachers ────────────────────────────────────────────────────
const getTeachers = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active,
              json_agg(
                json_build_object(
                  'class_subject_id', cs.id,
                  'class_id', cs.class_id,
                  'class_name', c.name,
                  'section', c.section,
                  'subject_id', cs.subject_id,
                  'subject_name', s.name,
                  'periods_per_week', cs.periods_per_week
                )
              ) FILTER (WHERE cs.id IS NOT NULL) AS class_subjects
       FROM users u
       LEFT JOIN class_subjects cs ON cs.teacher_id = u.id
       LEFT JOIN classes c ON c.id = cs.class_id
       LEFT JOIN subjects s ON s.id = cs.subject_id
       WHERE u.school_id = $1 AND u.role = 'teacher'
       GROUP BY u.id
       ORDER BY u.name`,
      [school_id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/workload ────────────────────────────────────────────────────
const getTeacherWorkload = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;

    const result = await query(
      `SELECT u.id, u.name, u.email,
              COUNT(DISTINCT cs.id)       AS subjects_count,
              COALESCE(SUM(cs.periods_per_week), 0) AS total_periods_per_week
       FROM users u
       LEFT JOIN class_subjects cs ON cs.teacher_id = u.id
       LEFT JOIN classes c ON c.id = cs.class_id AND c.school_id = $1
       WHERE u.school_id = $1 AND u.role = 'teacher'
       GROUP BY u.id
       ORDER BY total_periods_per_week DESC`,
      [school_id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getTeachers,
  getTeacherWorkload,
};
