'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getLessonPlans, getLessonPlanById,
  createLessonPlan, generateLessonPlan,
  updateLessonPlan, deleteLessonPlan,
} = require('../controllers/lessonPlanController');

router.use(authenticateJWT);

// Static path before /:id
router.post(
  '/generate',
  authorizeRole('teacher', 'admin'),
  validateBody(['class_subject_id', 'topic']),
  generateLessonPlan
);

router.get('/',    authorizeRole('teacher', 'admin'), getLessonPlans);
router.get('/:id', getLessonPlanById);

router.post(
  '/',
  authorizeRole('teacher'),
  validateBody(['class_subject_id', 'title', 'content']),
  createLessonPlan
);

router.put('/:id',    authorizeRole('teacher', 'admin'), updateLessonPlan);
router.delete('/:id', authorizeRole('teacher', 'admin'), deleteLessonPlan);

module.exports = router;
