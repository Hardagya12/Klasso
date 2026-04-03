const express = require('express');
const { getAllSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const router = express.Router();

router.use(authenticateJWT);

router.get('/', getAllSubjects);
router.post('/', authorizeRole('admin'), validateBody(['name']), createSubject);
router.put('/:id', authorizeRole('admin'), updateSubject);
router.delete('/:id', authorizeRole('admin'), deleteSubject);

module.exports = router;
