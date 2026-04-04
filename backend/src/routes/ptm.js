'use strict';

const express = require('express');
const router = express.Router();
const ptmController = require('../controllers/ptmController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Parent/Teacher fetching their own dashboards
router.get('/teacher/:teacherId', ptmController.getTeacherDayDashboard);
router.get('/parent/:parentId', ptmController.getParentDashboard);

// Standard slot ops (Teacher / Admin can fetch/complete)
router.get('/:slotId/talking-points', ptmController.getSlotTalkingPoints);
router.patch('/:slotId/complete', restrictTo('TEACHER', 'ADMIN', 'SCHOOL_ADMIN'), ptmController.completeSlot);

// Event and Slot Creation (Admin logic)
router.post('/', restrictTo('ADMIN', 'SCHOOL_ADMIN'), ptmController.createEvent);
router.post('/:ptmEventId/slots', restrictTo('ADMIN', 'SCHOOL_ADMIN'), ptmController.createSlot);

module.exports = router;
