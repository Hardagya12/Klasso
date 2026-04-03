const express = require('express');
const { register, login, getMe, updateProfile, changePassword, logout } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const router = express.Router();

router.post('/register', validateBody(['name', 'email', 'password', 'role']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.get('/me', authenticateJWT, getMe);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/change-password', authenticateJWT, validateBody(['currentPassword', 'newPassword']), changePassword);
router.post('/logout', authenticateJWT, logout);

module.exports = router;
