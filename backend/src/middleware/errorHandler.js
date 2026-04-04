'use strict';

/**
 * Global Express error handler (4-param signature required by Express).
 * Maps Postgres error codes, Prisma errors, and JWT errors to appropriate HTTP status codes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired, please login again',
    });
  }

  // ── Prisma errors ──────────────────────────────────────────────────────────
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists.',
          detail: isDev ? err.meta : undefined,
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Record not found.',
          detail: isDev ? err.meta : undefined,
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: 'Referenced record does not exist.',
          detail: isDev ? err.meta : undefined,
        });
      default:
        break;
    }
  }

  if (err.constructor?.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided.',
      detail: isDev ? err.message : undefined,
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
        });

      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Referenced record does not exist.',
          detail: isDev ? err.detail : undefined,
        });

      case '22P02': // invalid_text_representation (bad UUID etc.)
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format.',
        });

      default:
        break;
    }
  }

  // ── ZodError ──────────────────────────────────────────────────────────────
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors?.map(e => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  // ── Generic fallback ─────────────────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  console.error('[ErrorHandler]', err);

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
