const jwt = require('jsonwebtoken');
const { query } = require('../db/neon');
const { sendError } = require('../utils/response');

const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Authentication required.', 401);
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const result = await query('SELECT * FROM users WHERE id = $1', [payload.id]);
        if (result.rows.length === 0) {
            return sendError(res, 'User not found.', 401);
        }

        const userRecord = result.rows[0];
        if (!userRecord.is_active) {
            return sendError(res, 'Account deactivated', 403);
        }

        req.user = payload;
        req.userRecord = userRecord;

        next();
    } catch (error) {
        next(error);
    }
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 'Forbidden', 403);
        }
        next();
    };
};

const authorizeOwnerOrRole = (getEntityUserId, ...roles) => {
    return async (req, res, next) => {
        try {
            if (req.user && roles.includes(req.user.role)) {
                return next();
            }

            const ownerId = await getEntityUserId(req);
            if (req.user && ownerId && req.user.id === ownerId) {
                return next();
            }

            return sendError(res, 'Forbidden', 403);
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticateJWT,
    authorizeRole,
    authorizeOwnerOrRole
};
