const express = require('express');
const router = express.Router();
const xpController = require('../controllers/classXpController');
const { authenticateJWT } = require('../middleware/auth');

// Apply auth to all XP routes
router.use(authenticateJWT);

router.get('/class/:classId', xpController.getClassXpDetails);
router.post('/class/:classId/bonus', xpController.awardBonusXp);
router.get('/class/:classId/events', xpController.getClassXpEvents);
router.get('/school/:schoolId/leaderboard', xpController.getSchoolLeaderboard);

module.exports = router;
