'use strict';

const jwt = require('jsonwebtoken');
const { query } = require('../db/neon');

/**
 * authenticateJWT
 * Verifies Bearer token, attaches req.user (decoded payload) and
 * req.userRecord (fresh DB row). Blocks deactivated accounts.
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload immediately
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      school_id: decoded.school_id,
      name: decoded.name,
    };

    // Fetch fresh user record for is_active check
    const result = await query(
      'SELECT id, email, role, school_id, name, phone, avatar_url, is_active, last_login, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userRecord = result.rows[0];

    if (!userRecord.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    req.userRecord = userRecord;
    next();
  } catch (err) {
    next(err); // JWT errors handled by errorHandler
  }
};

/**
 * authorizeRole(...roles)
 * Returns middleware that allows only users whose role is in the given list.
 * Comparison is case-insensitive so routes can use TEACHER/teacher and DB can store either.
 */
const authorizeRole = (...roles) => {
  const allowed = new Set(roles.map((r) => String(r).toUpperCase()));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    if (!allowed.has(String(req.user.role).toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * authorizeOwnerOrRole(getEntityUserId, ...roles)
 * Allows access if:
 *   - req.user.role is in the given roles list, OR
 *   - req.user.id matches the entity's owner user_id (returned by getEntityUserId(req))
 *
 * @param {Function} getEntityUserId - async fn(req) → owner_user_id string
 * @param {...string} roles          - roles that bypass ownership check
 */
const authorizeOwnerOrRole = (getEntityUserId, ...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const allowed = new Set(roles.map((r) => String(r).toUpperCase()));
      if (allowed.has(String(req.user.role).toUpperCase())) {
        return next();
      }

      // Otherwise check ownership
      const ownerUserId = await getEntityUserId(req);
      if (ownerUserId && ownerUserId === req.user.id) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
      });
    } catch (err) {
      next(err);
    }
  };
};

/** Aliases used by some route modules */
const requireAuth = authenticateJWT;
const requireRole = authorizeRole;
const protect = authenticateJWT;
const restrictTo = authorizeRole;

/** Same as authorizeRole (kept for route files that import this name) */
const authorizeRoles = authorizeRole;

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizeOwnerOrRole,
  requireAuth,
  requireRole,
  authorizeRoles,
  protect,
  restrictTo,
};
