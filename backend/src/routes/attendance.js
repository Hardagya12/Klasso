'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  markAttendance, getSessionAttendance,
  getStudentAttendance, getClassAttendanceSummary,
  createQRSession, markViaQR,
} = require('../controllers/attendanceController');

router.use(authenticateJWT);

// Mark attendance for a whole session
router.post('/session', authorizeRole('teacher','admin'), validateBody(['class_id','date','records']), markAttendance);

// Get session records
router.get('/session', authorizeRole('teacher','admin'), validateQuery(['class_id','date']), getSessionAttendance);

// Summary for a student
router.get('/student/:studentId', getStudentAttendance);

// Summary per student for a class
router.get('/class/:classId/summary', authorizeRole('teacher','admin'), getClassAttendanceSummary);

// QR flow (teacher creates, student scans)
router.post('/qr-session', authorizeRole('teacher','admin'), validateBody(['class_id']), createQRSession);
router.post('/qr-mark', authorizeRole('student'), validateBody(['token']), markViaQR);

module.exports = router;
