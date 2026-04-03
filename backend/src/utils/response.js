'use strict';

/**
 * sendSuccess – 200 (or custom statusCode) with data payload
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * sendError – error response with message
 */
const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * sendPaginated – wraps a list + metadata in a standard paginated envelope
 *
 * @param {Response} res
 * @param {Array}    data       - the current page's records
 * @param {number}   total      - total count of matching records
 * @param {Object}   pagination - { page, limit, offset } from req.pagination
 */
const sendPaginated = (res, data, total, pagination) => {
  const { page, limit } = pagination;
  const total_pages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    },
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
