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
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
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

      // Allow if user has one of the privileged roles
      if (roles.includes(req.user.role)) {
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

module.exports = { authenticateJWT, authorizeRole, authorizeOwnerOrRole };
