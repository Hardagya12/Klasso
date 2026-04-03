'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getClassSubjects,
  assignSubject,
  removeSubject,
  getClassTimetable,
} = require('../controllers/classController');

router.use(authenticateJWT);

// GET /api/classes
router.get('/', validatePagination, getAllClasses);

// GET /api/classes/:id
router.get('/:id', getClassById);

// POST /api/classes
router.post(
  '/',
  authorizeRole('admin'),
  validateBody(['name', 'section']),
  createClass
);

// PUT /api/classes/:id
router.put('/:id', authorizeRole('admin'), updateClass);

// DELETE /api/classes/:id
router.delete('/:id', authorizeRole('admin'), deleteClass);

// GET /api/classes/:id/students
router.get('/:id/students', authorizeRole('teacher', 'admin'), getClassStudents);

// GET /api/classes/:id/subjects
router.get('/:id/subjects', getClassSubjects);

// POST /api/classes/:id/subjects
router.post(
  '/:id/subjects',
  authorizeRole('admin'),
  validateBody(['subject_id']),
  assignSubject
);

// DELETE /api/classes/:classId/subjects/:subjectId
router.delete('/:classId/subjects/:subjectId', authorizeRole('admin'), removeSubject);

// GET /api/classes/:id/timetable
router.get('/:id/timetable', getClassTimetable);

module.exports = router;
