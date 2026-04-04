'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/neon');
const { prisma } = require('../db/prisma');
const { sendSuccess, sendError } = require('../utils/response');

const SALT_ROUNDS = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip password_hash before sending to client */
const sanitizeUser = (user) => {
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
};

/** Sign a JWT token */
const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/** Sign a refresh token */
const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  );

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password, role, school_id? }
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, school_id = null } = req.body;

    // Check for duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return sendError(res, 'Email already registered', 409);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, school_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, school_id, phone, avatar_url, is_active, created_at`,
      [name, email.toLowerCase(), password_hash, role, school_id]
    );

    const user = result.rows[0];
    const token = signToken(user);
    const refreshToken = signRefreshToken(user);

    return sendSuccess(res, { token, refreshToken, user: sanitizeUser(user) }, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!result.rows.length) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return sendError(res, 'Account deactivated. Contact your school administrator.', 403);
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Update last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    user.last_login = new Date();

    const token = signToken(user);
    const refreshToken = signRefreshToken(user);

    return sendSuccess(
      res,
      { token, refreshToken, user: sanitizeUser(user) },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns fresh user data with role-specific info
 */
const getMe = async (req, res, next) => {
  try {
    // Use Prisma to get user with role-specific relations
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        lastLogin: true,
        settings: true,
        createdAt: true,
        // Student profile
        studentProfile: {
          select: {
            id: true,
            classId: true,
            rollNo: true,
            admissionNo: true,
            dob: true,
            gender: true,
            class: {
              select: {
                id: true,
                name: true,
                section: true,
                schoolId: true,
              }
            }
          }
        },
        // Teacher's class subjects
        classSubjectsTeaching: {
          select: {
            id: true,
            classId: true,
            subjectId: true,
            class: { select: { id: true, name: true, section: true } },
            subject: { select: { id: true, name: true, code: true } },
          }
        },
        // Parent links to students
        studentParentLinks: {
          select: {
            id: true,
            isPrimary: true,
            relation: true,
            student: {
              select: {
                id: true,
                rollNo: true,
                classId: true,
                user: { select: { id: true, name: true, email: true } },
                class: { select: { id: true, name: true, section: true } },
              }
            }
          }
        },
        // Classes as homeroom teacher
        classesAsHomeroom: {
          select: {
            id: true,
            name: true,
            section: true,
            schoolId: true,
          }
        },
      }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const [firstName, ...rest] = (user.name || '').split(' ');
    const lastName = rest.join(' ');

    // Build response with snake_case for frontend compatibility
    const response = {
      id: user.id,
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      school_id: user.schoolId,
      phone: user.phone,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
      last_login: user.lastLogin,
      settings: user.settings,
      created_at: user.createdAt,
    };

    // Add role-specific data
    if (user.role === 'student' && user.studentProfile) {
      response.student = {
        id: user.studentProfile.id,
        class_id: user.studentProfile.classId,
        roll_no: user.studentProfile.rollNo,
        admission_no: user.studentProfile.admissionNo,
        dob: user.studentProfile.dob,
        gender: user.studentProfile.gender,
        class_name: user.studentProfile.class ? `${user.studentProfile.class.name}-${user.studentProfile.class.section}` : null,
      };
    }

    if (user.role === 'teacher') {
      response.classSubjects = user.classSubjectsTeaching.map(cs => ({
        id: cs.id,
        class_id: cs.classId,
        subject_id: cs.subjectId,
        class: cs.class ? { id: cs.class.id, name: cs.class.name, section: cs.class.section } : null,
        subject: cs.subject ? { id: cs.subject.id, name: cs.subject.name, code: cs.subject.code } : null,
      }));
      response.homeroomClasses = user.classesAsHomeroom.map(c => ({
        id: c.id,
        name: c.name,
        section: c.section,
        school_id: c.schoolId,
      }));
    }

    if (user.role === 'parent') {
      response.children = user.studentParentLinks.map(link => ({
        id: link.student.id,
        is_primary: link.isPrimary,
        relation: link.relation,
        roll_no: link.student.rollNo,
        class_id: link.student.classId,
        user: link.student.user ? {
          id: link.student.user.id,
          name: link.student.user.name,
          email: link.student.user.email,
        } : null,
        class: link.student.class ? {
          id: link.student.class.id,
          name: link.student.class.name,
          section: link.student.class.section,
        } : null,
      }));
    }

    return sendSuccess(res, response);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, 'Refresh token required', 400);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
    );

    const result = await query(
      'SELECT id, name, email, role, school_id, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'User not found', 404);
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return sendError(res, 'Account deactivated', 403);
    }

    const newToken = signToken(user);
    return sendSuccess(res, { token: newToken }, 'Token refreshed');
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Body: { name?, phone?, avatar_url? }
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar_url, settings } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx++}`); params.push(name); }
    if (phone !== undefined) { updates.push(`phone = $${idx++}`); params.push(phone); }
    if (avatar_url !== undefined) { updates.push(`avatar_url = $${idx++}`); params.push(avatar_url); }
    if (settings !== undefined) {
      if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
        return sendError(res, 'settings must be a JSON object', 400);
      }
      updates.push(`settings = COALESCE(settings, '{}'::jsonb) || $${idx++}::jsonb`);
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    params.push(req.user.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, school_id, phone, avatar_url, is_active, last_login, settings, created_at`,
      params
    );

    return sendSuccess(res, result.rows[0], 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/change-password
 * Body: { current_password, new_password }
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    // Fetch current hash
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    const new_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [new_hash, req.user.id]);

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Updates last_login timestamp. Client is responsible for dropping the token.
 */
const logout = async (req, res, next) => {
  try {
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [req.user.id]);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, logout, refreshTokenHandler };
