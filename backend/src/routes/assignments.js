'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAllAssignments, getAssignmentById, createAssignment, updateAssignment,
  deleteAssignment, submitAssignment, getSubmissions, gradeSubmission,
} = require('../controllers/assignmentController');

router.use(authenticateJWT);

router.get('/', validatePagination, getAllAssignments);
router.get('/:id', getAssignmentById);
router.post('/', authorizeRole('teacher','admin'), validateBody(['class_subject_id','title','due_date']), createAssignment);
router.put('/:id', authorizeRole('teacher','admin'), updateAssignment);
router.delete('/:id', authorizeRole('teacher','admin'), deleteAssignment);

// Student submission
router.post('/:id/submit', authorizeRole('student'), submitAssignment);

// View all submissions (teacher/admin)
router.get('/:id/submissions', authorizeRole('teacher','admin'), getSubmissions);

// Grade a submission
router.put('/:id/submissions/:submissionId/grade', authorizeRole('teacher','admin'), validateBody(['score']), gradeSubmission);

module.exports = router;
