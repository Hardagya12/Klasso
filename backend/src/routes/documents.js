'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { getStudentDocuments, generateDocument, getDocumentById, issueDocument } = require('../controllers/documentController');

router.use(authenticateJWT);

// Static path before /:id
router.post('/generate', authorizeRole('admin','teacher'), validateBody(['student_id','type']), generateDocument);
router.get('/student/:id', getStudentDocuments);
router.get('/:id',         getDocumentById);
router.put('/:id/issue',   authorizeRole('admin'), issueDocument);

module.exports = router;
