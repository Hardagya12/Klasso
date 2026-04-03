const { query } = require('../db/neon');

const createNotification = async (userId, title, message, type, entityType, entityId) => {
    const sql = `
        INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const result = await query(sql, [userId, title, message, type, entityType, entityId]);
    return result.rows[0];
};

const createNotificationsForMany = async (userIds, title, message, type, entityType, entityId) => {
    if (!userIds || userIds.length === 0) return [];

    const values = userIds.map((userId, index) => {
        const offset = index * 6;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
    }).join(', ');

    const params = [];
    for (const userId of userIds) {
        params.push(userId, title, message, type, entityType, entityId);
    }

    const sql = `
        INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
        VALUES ${values}
        RETURNING *;
    `;
    
    const result = await query(sql, params);
    return result.rows;
};

module.exports = {
    createNotification,
    createNotificationsForMany
};
