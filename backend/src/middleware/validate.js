'use strict';

/**
 * validateBody(fields)
 * Checks that every field name in `fields` exists and is non-empty in req.body.
 */
const validateBody = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * validateQuery(fields)
 * Checks that every field name in `fields` exists in req.query.
 */
const validateQuery = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.query[f] === undefined || req.query[f] === null || req.query[f] === ''
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required query parameter(s): ${missing.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * validatePagination
 * Parses ?page= and ?limit= from query string and attaches
 * req.pagination = { page, limit, offset } with sane defaults.
 *
 * Defaults : page=1, limit=20
 * Max limit : 100
 */
const validatePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  req.pagination = { page, limit, offset };
  next();
};

module.exports = { validateBody, validateQuery, validatePagination };
