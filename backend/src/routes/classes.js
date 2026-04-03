const express = require('express');
const {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassStudents,
    getClassSubjects,
    assignSubject,
    removeSubject,
    getClassTimetable
} = require('../controllers/classController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const router = express.Router();

router.use(authenticateJWT);

router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.post('/', authorizeRole('admin'), validateBody(['name', 'academic_year_id']), createClass);
router.put('/:id', authorizeRole('admin'), updateClass);
router.delete('/:id', authorizeRole('admin'), deleteClass);

router.get('/:id/students', authorizeRole('admin', 'teacher'), getClassStudents);

router.get('/:id/subjects', getClassSubjects);
router.post('/:id/subjects', authorizeRole('admin'), validateBody(['subject_id']), assignSubject);
router.delete('/:classId/subjects/:subjectId', authorizeRole('admin'), removeSubject);

router.get('/:id/timetable', getClassTimetable);

module.exports = router;
