'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const {
  getAdminDashboard, getTeacherDashboard, getParentDashboard, getStudentDashboard,
  getClassAnalytics, exportAttendanceReport, exportMarksReport,
} = require('../controllers/analyticsController');

router.use(authenticateJWT);

router.get('/admin',   authorizeRole('admin'),           getAdminDashboard);
router.get('/teacher', authorizeRole('teacher','admin'), getTeacherDashboard);
router.get('/parent',  authorizeRole('parent'),          getParentDashboard);
router.get('/student', authorizeRole('student'),         getStudentDashboard);
router.get('/student/:id', authorizeRole('parent', 'admin', 'teacher'), getStudentDashboard);
router.get('/class/:id', authorizeRole('teacher','admin'), getClassAnalytics);
router.get('/export/attendance', authorizeRole('teacher','admin'), exportAttendanceReport);
router.get('/export/marks',      authorizeRole('teacher','admin'), exportMarksReport);

module.exports = router;
