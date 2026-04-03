'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { getFeeTypes, createFeeType, getStudentFeeStatus, getPendingFees, recordPayment, getPaymentById, getFeeSummary } = require('../controllers/feeController');

router.use(authenticateJWT);

// Static paths first
router.get('/types',     authorizeRole('admin'), getFeeTypes);
router.post('/types',    authorizeRole('admin'), validateBody(['name','amount']), createFeeType);
router.get('/pending',   authorizeRole('admin'), getPendingFees);
router.get('/summary',   authorizeRole('admin'), getFeeSummary);
router.post('/payment',  authorizeRole('admin','parent'), validateBody(['student_id','fee_type_id','amount_paid']), recordPayment);
router.get('/payment/:id', getPaymentById);
router.get('/student/:id', getStudentFeeStatus);

module.exports = router;
