const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deactivateUser, getTeachers, getTeacherWorkload } = require('../controllers/userController');
const { authenticateJWT, authorizeRole, authorizeOwnerOrRole } = require('../middleware/auth');
const { validatePagination, validateBody } = require('../middleware/validate');
const router = express.Router();

router.use(authenticateJWT);

// Admin / specific roles accessible routes
router.get('/', authorizeRole('admin'), validatePagination, getAllUsers);
router.get('/teachers', authorizeRole('admin'), getTeachers);
router.get('/workload', authorizeRole('admin'), getTeacherWorkload);

// Personal or Admin accessible
// Example: a user can view their own profile, but only admin can view others.
// We define a simple getter that returns req.params.id
router.get('/:id', authorizeOwnerOrRole(async (req) => req.params.id, 'admin'), getUserById);

// Admin restricted
router.post('/', authorizeRole('admin'), validateBody(['name', 'email', 'password', 'role']), createUser);
router.put('/:id', authorizeRole('admin'), updateUser);
router.delete('/:id', authorizeRole('admin'), deactivateUser);

module.exports = router;
