'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment,
  submitAssignment, getSubmissions, gradeSubmission,
  getMyPendingAssignments, getMySubmittedAssignments,
} = require('../controllers/assignmentController');

router.use(authenticateJWT);

// Static named paths before /:id
router.get('/my/pending',   authorizeRole('student'), getMyPendingAssignments);
router.get('/my/submitted', authorizeRole('student'), getMySubmittedAssignments);

router.get('/',    validatePagination, getAssignments);
router.get('/:id', getAssignmentById);

router.post('/', authorizeRole('teacher'), validateBody(['class_subject_id','title','due_date']), createAssignment);
router.put('/:id',    authorizeRole('teacher','admin'), updateAssignment);
router.delete('/:id', authorizeRole('teacher','admin'), deleteAssignment);

// Submission paths — static before /:id sub-routes
router.put('/submissions/:id/grade', authorizeRole('teacher'), validateBody(['score']), gradeSubmission);
router.post('/:id/submit',           authorizeRole('student'), submitAssignment);
router.get('/:id/submissions',       authorizeRole('teacher','admin'), getSubmissions);

module.exports = router;
