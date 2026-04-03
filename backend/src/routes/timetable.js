'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getTimetable, createSlot, updateSlot, deleteSlot,
  getConflicts, getTeacherSchedule, getTeacherWorkload,
  createSubstitution, getSubstitutions,
} = require('../controllers/timetableController');

router.use(authenticateJWT);

// Static paths first
router.get('/conflicts',                   authorizeRole('admin'), getConflicts);
router.get('/workload',                    authorizeRole('admin'), getTeacherWorkload);
router.get('/teacher/:teacher_id',         getTeacherSchedule);
router.get('/substitution',                getSubstitutions);
router.post('/substitution',               authorizeRole('admin','teacher'), validateBody(['timetable_slot_id','date','substitute_teacher_id']), createSubstitution);

router.get('/',    getTimetable);
router.post('/',   authorizeRole('admin','teacher'), validateBody(['class_id','class_subject_id','day_of_week','period_number','start_time','end_time']), createSlot);
router.put('/:id', authorizeRole('admin','teacher'), updateSlot);
router.delete('/:id', authorizeRole('admin','teacher'), deleteSlot);

module.exports = router;
