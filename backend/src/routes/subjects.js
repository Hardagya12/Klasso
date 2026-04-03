'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

router.use(authenticateJWT);

// GET /api/subjects
router.get('/', getAllSubjects);

// POST /api/subjects
router.post('/', authorizeRole('admin'), validateBody(['name']), createSubject);

// PUT /api/subjects/:id
router.put('/:id', authorizeRole('admin'), updateSubject);

// DELETE /api/subjects/:id
router.delete('/:id', authorizeRole('admin'), deleteSubject);

module.exports = router;
