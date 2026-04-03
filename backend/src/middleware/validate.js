const { sendError } = require('../utils/response');

const validateBody = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field] === undefined) {
                return sendError(res, `Missing required field: ${field}`, 400);
            }
        }
        next();
    };
};

const validateQuery = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.query[field] === undefined) {
                return sendError(res, `Missing required query parameter: ${field}`, 400);
            }
        }
        next();
    };
};

const validatePagination = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;

    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    req.pagination = {
        page,
        limit,
        offset: (page - 1) * limit
    };

    next();
};

module.exports = {
    validateBody,
    validateQuery,
    validatePagination
};
