'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent,
  linkParent, unlinkParent,
} = require('../controllers/studentController');

router.use(authenticateJWT);

router.get('/', authorizeRole('admin','teacher'), validatePagination, getAllStudents);
router.get('/:id', getStudentById);
router.post('/', authorizeRole('admin'), validateBody(['user_id','class_id','roll_no']), createStudent);
router.put('/:id', authorizeRole('admin'), updateStudent);
router.delete('/:id', authorizeRole('admin'), deleteStudent);
router.post('/:id/parents', authorizeRole('admin'), validateBody(['parent_id']), linkParent);
router.delete('/:id/parents/:parentId', authorizeRole('admin'), unlinkParent);

module.exports = router;
