'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const {
  getBriefing,
  getMyBriefings,
  regenerateBriefing,
} = require('../controllers/subBriefingController');

router.use(authenticateJWT);

// List upcoming substitution briefings for the authenticated substitute teacher
router.get('/my-briefings', authorizeRole('teacher', 'admin'), getMyBriefings);

// Get, mark-viewed, and regenerate for a specific substitution
router.get('/:substitutionId/briefing', authorizeRole('teacher', 'admin'), getBriefing);
router.post('/:substitutionId/briefing/regenerate', authorizeRole('admin'), regenerateBriefing);

module.exports = router;
