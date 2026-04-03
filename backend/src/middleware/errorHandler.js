'use strict';

/**
 * Global Express error handler (4-param signature required by Express).
 * Maps Postgres error codes and JWT errors to appropriate HTTP status codes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      ...(isDev && { stack: err.stack }),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired, please login again',
      ...(isDev && { stack: err.stack }),
    });
  }

  // ── PostgreSQL errors ────────────────────────────────────────────────────────
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists.',
          detail: isDev ? err.detail : undefined,
          ...(isDev && { stack: err.stack }),
        });

      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Referenced record does not exist.',
          detail: isDev ? err.detail : undefined,
          ...(isDev && { stack: err.stack }),
        });

      case '22P02': // invalid_text_representation (bad UUID etc.)
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format.',
          ...(isDev && { stack: err.stack }),
        });

      default:
        break;
    }
  }

  // ── Generic fallback ─────────────────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  console.error('[ErrorHandler]', err);

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
