'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getFeeTypes, createFeeType, updateFeeType, deleteFeeType,
  getPayments, recordPayment, getDefaulters,
} = require('../controllers/feeController');

router.use(authenticateJWT);

// Fee types
router.get('/types', authorizeRole('admin'), getFeeTypes);
router.post('/types', authorizeRole('admin'), validateBody(['name','amount']), createFeeType);
router.put('/types/:id', authorizeRole('admin'), updateFeeType);
router.delete('/types/:id', authorizeRole('admin'), deleteFeeType);

// Payments
router.get('/payments', authorizeRole('admin'), validatePagination, getPayments);
router.post('/payments', authorizeRole('admin'), validateBody(['student_id','fee_type_id','amount_paid']), recordPayment);

// Defaulter list
router.get('/defaulters', authorizeRole('admin'), getDefaulters);

module.exports = router;
