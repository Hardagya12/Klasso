'use strict';

const express = require('express');
const router = express.Router();
const ptmController = require('../controllers/ptmController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

router.use(authenticateJWT);

// Parent/Teacher fetching their own dashboards
router.get('/teacher/:teacherId', ptmController.getTeacherDayDashboard);
router.get('/parent/:parentId', ptmController.getParentDashboard);

// Standard slot ops (Teacher / Admin can fetch/complete)
router.get('/:slotId/talking-points', ptmController.getSlotTalkingPoints);
router.patch('/:slotId/complete', authorizeRole('teacher', 'admin', 'school_admin'), ptmController.completeSlot);

// Event and Slot Creation (Admin logic)
router.post('/', authorizeRole('admin', 'school_admin'), ptmController.createEvent);
router.post('/:ptmEventId/slots', authorizeRole('admin', 'school_admin'), ptmController.createSlot);

module.exports = router;
