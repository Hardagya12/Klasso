'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getExams, getExamById, createExam, updateExam, deleteExam,
  addSubjectToExam, removeSubjectFromExam, getExamSchedule,
} = require('../controllers/examController');

router.use(authenticateJWT);

router.get('/',    getExams);
router.get('/:id', getExamById);

router.post(
  '/',
  authorizeRole('teacher', 'admin'),
  validateBody(['name', 'class_id']),
  createExam
);

router.put('/:id',    authorizeRole('teacher', 'admin'), updateExam);
router.delete('/:id', authorizeRole('admin'),            deleteExam);

// Exam subjects
router.post(
  '/:id/subjects',
  authorizeRole('teacher', 'admin'),
  validateBody(['subject_id']),
  addSubjectToExam
);

router.delete('/:examId/subjects/:subjectId', authorizeRole('admin'), removeSubjectFromExam);

// Exam schedule / countdown
router.get('/:id/schedule', getExamSchedule);

module.exports = router;
