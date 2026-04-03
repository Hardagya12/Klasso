'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  generateReport, generateBulkReports,
  getStudentReports, getReportById,
  approveReport, updateReport, deleteReport,
} = require('../controllers/reportController');

router.use(authenticateJWT);

// Generate (static paths before /:id)
router.post('/generate/:student_id',    authorizeRole('teacher', 'admin'), generateReport);
router.post('/generate-bulk/:class_id', authorizeRole('teacher', 'admin'), generateBulkReports);

// List for a student
router.get('/student/:student_id', getStudentReports);

// Single report
router.get('/:id',            getReportById);
router.put('/:id/approve',    authorizeRole('teacher', 'admin'), approveReport);
router.put('/:id',            authorizeRole('teacher'),           validateBody(['content']), updateReport);
router.delete('/:id',         authorizeRole('admin'),             deleteReport);

module.exports = router;
