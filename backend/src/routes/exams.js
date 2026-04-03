'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getAllExams, getExamById, createExam, updateExam, deleteExam,
  enterMarks, getExamMarks, getExamResult,
} = require('../controllers/examController');

router.use(authenticateJWT);

router.get('/', getAllExams);
router.get('/:id', getExamById);
router.post('/', authorizeRole('admin'), validateBody(['class_id','name']), createExam);
router.put('/:id', authorizeRole('admin'), updateExam);
router.delete('/:id', authorizeRole('admin'), deleteExam);

// Marks
router.post('/:id/marks', authorizeRole('teacher','admin'), validateBody(['exam_subject_id','marks']), enterMarks);
router.get('/:id/marks', getExamMarks);

// Full result card
router.get('/:id/result', getExamResult);

module.exports = router;
