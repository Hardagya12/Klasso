'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole, authorizeOwnerOrRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getTeachers,
  getTeacherWorkload,
} = require('../controllers/userController');

// All routes require authentication
router.use(authenticateJWT);

// NOTE: specific paths must be declared before /:id to avoid route shadowing
// GET /api/users/teachers
router.get('/teachers', authorizeRole('admin'), getTeachers);

// GET /api/users/workload
router.get('/workload', authorizeRole('admin'), getTeacherWorkload);

// GET /api/users  (admin only, paginated)
router.get('/', authorizeRole('admin'), validatePagination, getAllUsers);

// GET /api/users/:id  (admin or own user)
router.get(
  '/:id',
  authorizeOwnerOrRole((req) => Promise.resolve(req.params.id), 'admin'),
  getUserById
);

// POST /api/users  (admin only)
router.post(
  '/',
  authorizeRole('admin'),
  validateBody(['name', 'email', 'role']),
  createUser
);

// PUT /api/users/:id  (admin only)
router.put('/:id', authorizeRole('admin'), updateUser);

// DELETE /api/users/:id  (admin only — soft delete)
router.delete('/:id', authorizeRole('admin'), deactivateUser);

module.exports = router;
