'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getStudentStreak,
  getLeaderboard,
  getClassSummary,
  markBadgesSeen
} = require('../controllers/streakController');

router.use(authenticateJWT);

// GET /api/streak/student/:studentId
router.get('/student/:studentId', getStudentStreak);

// GET /api/streak/leaderboard/:classId
router.get('/leaderboard/:classId', getLeaderboard);

// GET /api/streak/class/:classId/summary
router.get('/class/:classId/summary', authorizeRole('teacher', 'admin'), getClassSummary);

// PATCH /api/streak/badges/mark-seen
router.patch('/badges/mark-seen', authorizeRole('student'), validateBody(['badgeIds']), markBadgesSeen);

module.exports = router;
