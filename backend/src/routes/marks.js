'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  bulkInsertMarks, getMarksGrid, getStudentMarks,
  getClassAnalytics, getStudentTrend, updateMark, deleteMark,
} = require('../controllers/marksController');

router.use(authenticateJWT);

// Static analytics paths first (before /:id)
router.get('/analytics/class/:class_id', getClassAnalytics);
router.get('/analytics/student/:id',     getStudentTrend);
router.get('/student/:student_id',       getStudentMarks);

// Grid
router.get('/', getMarksGrid);

// Bulk insert
router.post(
  '/bulk',
  authorizeRole('teacher', 'admin'),
  validateBody(['exam_id', 'marks']),
  bulkInsertMarks
);

// Edit / delete single mark
router.put('/:id',    authorizeRole('teacher', 'admin'), updateMark);
router.delete('/:id', authorizeRole('admin'),            deleteMark);

module.exports = router;
