'use strict';

const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshTokenHandler,
} = require('../controllers/authController');

// POST /api/auth/register
router.post(
  '/register',
  validateBody(['name', 'email', 'password', 'role']),
  register
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(['email', 'password']),
  login
);

// POST /api/auth/refresh
router.post('/refresh', refreshTokenHandler);

// GET /api/auth/me
router.get('/me', authenticateJWT, getMe);

// PUT /api/auth/profile
router.put('/profile', authenticateJWT, updateProfile);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticateJWT,
  validateBody(['current_password', 'new_password']),
  changePassword
);

// POST /api/auth/logout
router.post('/logout', authenticateJWT, logout);

module.exports = router;
