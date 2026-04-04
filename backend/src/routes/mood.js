'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const moodController = require('../controllers/moodController');

router.use(authenticateJWT);

router.post(
  '/checkin',
  authorizeRole('student'),
  moodController.postCheckIn
);

router.get(
  '/my-summary',
  authorizeRole('student'),
  moodController.getMySummary
);

router.get(
  '/alerts',
  authorizeRole('teacher'),
  moodController.getTeacherAlerts
);

router.patch(
  '/alerts/:id/read',
  authorizeRole('teacher'),
  moodController.markAlertRead
);

module.exports = router;
