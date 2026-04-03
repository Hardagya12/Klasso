const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Postgres error codes
    if (err.code === '23505') {
        return sendError(res, 'A record with this information already exists.', 409);
    }
    if (err.code === '23503') {
        return sendError(res, 'Foreign key constraint violated.', 400);
    }
    if (err.code === '22P02') {
        return sendError(res, 'Invalid UUID format.', 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid token.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired, please login again.', 401);
    }

    const message = err.message || 'Internal Server Error';
    const statusCode = err.statusCode || 500;

    const dev = process.env.NODE_ENV === 'development';

    return res.status(statusCode).json({
        success: false,
        message,
        ...(dev && { stack: err.stack })
    });
};

module.exports = errorHandler;
