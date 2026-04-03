'use strict';
const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validate');
const { getNotifications, getUnreadCount, markOneRead, markAllRead, deleteNotification } = require('../controllers/notificationController');

router.use(authenticateJWT);

// Static paths before /:id
router.get('/count',      getUnreadCount);
router.put('/read-all',   markAllRead);

router.get('/',    validatePagination, getNotifications);
router.put('/:id/read',  markOneRead);
router.delete('/:id',    deleteNotification);

module.exports = router;
