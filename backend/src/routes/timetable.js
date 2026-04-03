'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  getTimetable, createSlot, updateSlot, deleteSlot,
  createSubstitution, getSubstitutions,
} = require('../controllers/timetableController');

router.use(authenticateJWT);

router.get('/', getTimetable);
router.post('/', authorizeRole('admin'), validateBody(['class_id','class_subject_id','day_of_week','period_number','start_time','end_time']), createSlot);
router.put('/:id', authorizeRole('admin'), updateSlot);
router.delete('/:id', authorizeRole('admin'), deleteSlot);

router.post('/substitution', authorizeRole('admin'), validateBody(['timetable_slot_id','date','substitute_teacher_id']), createSubstitution);
router.get('/substitutions', getSubstitutions);

module.exports = router;
