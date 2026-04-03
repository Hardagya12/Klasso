'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole, authorizeRoles } = require('../middleware/auth');
const timecapsuleController = require('../controllers/timecapsuleController');

router.use(authenticateJWT);

router.post(
  '/generate/:studentId',
  authorizeRoles('teacher', 'admin'),
  timecapsuleController.generateForStudent
);

router.post(
  '/generate/class/:classId',
  authorizeRoles('admin', 'teacher'),
  timecapsuleController.generateForClass
);

router.get(
  '/student/:studentId',
  timecapsuleController.getStudentCapsule
);

router.get(
  '/:id/card',
  timecapsuleController.getCardImage
);

module.exports = router;
