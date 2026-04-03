'use strict';

const router  = require('express').Router();
const multer  = require('multer');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  getStudentAttendanceCalendar,
  getStudentMarks,
  getStudentAssignments,
  getStudentTimetable,
  getMyProfile,
} = require('../controllers/studentController');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateJWT);

// Static named routes MUST come before /:id
// GET /api/students/my/profile
router.get('/my/profile', authorizeRole('student'), getMyProfile);

// GET /api/students  (paginated, role-scoped)
router.get('/', validatePagination, getAllStudents);

// GET /api/students/:id
router.get('/:id', getStudentById);

// POST /api/students
router.post(
  '/',
  authorizeRole('admin', 'teacher'),
  validateBody(['name', 'email', 'roll_no', 'class_id']),
  createStudent
);

// PUT /api/students/:id
router.put('/:id', authorizeRole('admin', 'teacher'), updateStudent);

// DELETE /api/students/:id
router.delete('/:id', authorizeRole('admin'), deleteStudent);

// POST /api/students/bulk-import  (CSV)
router.post(
  '/bulk-import',
  authorizeRole('admin'),
  upload.single('file'),
  bulkImportStudents
);

// GET /api/students/:id/attendance  (?month=&year=)
router.get('/:id/attendance', getStudentAttendanceCalendar);

// GET /api/students/:id/marks
router.get('/:id/marks', getStudentMarks);

// GET /api/students/:id/assignments
router.get('/:id/assignments', getStudentAssignments);

// GET /api/students/:id/timetable
router.get('/:id/timetable', getStudentTimetable);

module.exports = router;
