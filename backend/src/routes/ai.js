'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { postChat } = require('../controllers/aiController');

router.use(authenticateJWT);

router.post(
  '/chat',
  authorizeRole('student', 'parent', 'teacher', 'admin'),
  validateBody(['messages']),
  postChat
);

module.exports = router;
