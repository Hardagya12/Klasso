'use strict';

const { query } = require('../db/neon');

/**
 * createNotification
 * Inserts a single notification for one user.
 *
 * @param {string} userId     - UUID of the recipient user
 * @param {string} title
 * @param {string} message
 * @param {string} type       - 'info' | 'warning' | 'alert' | 'success'
 * @param {string} entityType - e.g. 'attendance', 'marks', 'assignment', 'fee'
 * @param {string} entityId   - UUID of the related entity record (nullable)
 * @returns {Promise<Object>} the created notification row
 */
const createNotification = async (userId, title, message, type = 'info', entityType = null, entityId = null) => {
  const result = await query(
    `INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, title, message, type, entityType, entityId]
  );
  return result.rows[0];
};

/**
 * createNotificationsForMany
 * Bulk-inserts notifications for multiple users in a single query.
 *
 * @param {string[]} userIds   - array of user UUIDs
 * @param {string}   title
 * @param {string}   message
 * @param {string}   type
 * @param {string}   entityType
 * @param {string}   entityId
 * @returns {Promise<Object[]>} array of created notification rows
 */
const createNotificationsForMany = async (userIds, title, message, type = 'info', entityType = null, entityId = null) => {
  if (!userIds || userIds.length === 0) return [];

  // Build parameterised multi-row INSERT
  const valuePlaceholders = userIds.map(
    (_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
  );

  const params = userIds.flatMap((userId) => [userId, title, message, type, entityType, entityId]);

  const result = await query(
    `INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
     VALUES ${valuePlaceholders.join(', ')}
     RETURNING *`,
    params
  );

  return result.rows;
};

module.exports = { createNotification, createNotificationsForMany };
