'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const {
  createQuest,
  getStudentQuests,
  getClassQuests,
  manualComplete,
  deleteQuest,
  nudgeStudents,
} = require('../controllers/questController');

// All quest routes require authentication
router.use(authenticateJWT);

// POST /api/quests — create a new quest
router.post(
  '/',
  authorizeRole('teacher', 'admin'),
  createQuest
);

// GET /api/quests/student/:studentId — view student's quests + progress
router.get(
  '/student/:studentId',
  authorizeRole('student', 'teacher', 'admin', 'parent'),
  getStudentQuests
);

// GET /api/quests/class/:classId — class quest overview with stats
router.get(
  '/class/:classId',
  authorizeRole('teacher', 'admin'),
  getClassQuests
);

// PATCH /api/quests/:id/complete/:studentId — manually complete (CUSTOM type)
router.patch(
  '/:id/complete/:studentId',
  authorizeRole('teacher', 'admin'),
  manualComplete
);

// POST /api/quests/:id/nudge — send encouragement to incomplete students
router.post(
  '/:id/nudge',
  authorizeRole('teacher', 'admin'),
  nudgeStudents
);

// DELETE /api/quests/:id — delete a quest
router.delete(
  '/:id',
  authorizeRole('teacher', 'admin'),
  deleteQuest
);

module.exports = router;
