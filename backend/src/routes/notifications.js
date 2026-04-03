'use strict';

const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validate');
const {
  getNotifications, markOneRead, markAllRead, deleteNotification, getUnreadCount,
} = require('../controllers/notificationController');

router.use(authenticateJWT);

// Must declare static paths before /:id
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);

router.get('/', validatePagination, getNotifications);
router.patch('/:id/read', markOneRead);
router.delete('/:id', deleteNotification);

module.exports = router;
