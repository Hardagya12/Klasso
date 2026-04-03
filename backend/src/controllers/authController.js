'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/neon');
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

    return sendSuccess(res, sanitizeUser(result.rows[0]), 'User registered successfully', 201);
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

    return sendSuccess(
      res,
      { token, user: sanitizeUser(user) },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns fresh user data from DB (no password).
 */
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, school_id, phone, avatar_url, is_active, last_login, settings, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows.length) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, result.rows[0]);
  } catch (err) {
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

module.exports = { register, login, getMe, updateProfile, changePassword, logout };
