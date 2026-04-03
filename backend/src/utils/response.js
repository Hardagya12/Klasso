const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

const sendPaginated = (res, data, total, pagination) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: parseInt(pagination.page, 10),
            limit: parseInt(pagination.limit, 10),
            total: parseInt(total, 10),
            total_pages: Math.ceil(total / pagination.limit),
            has_next: (pagination.page * pagination.limit) < total,
            has_prev: pagination.page > 1
        }
    });
};

module.exports = {
    sendSuccess,
    sendError,
    sendPaginated
};
