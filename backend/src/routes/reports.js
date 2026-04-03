'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getStudentReport, getClassReport, getSavedReports, saveReport, approveReport,
} = require('../controllers/reportController');

router.use(authenticateJWT);

router.get('/student/:studentId', getStudentReport);
router.get('/class/:classId', authorizeRole('admin','teacher'), getClassReport);
router.get('/saved', getSavedReports);
router.post('/', authorizeRole('admin','teacher'), validateBody(['student_id','content']), saveReport);
router.patch('/:id/approve', authorizeRole('admin'), approveReport);

module.exports = router;
