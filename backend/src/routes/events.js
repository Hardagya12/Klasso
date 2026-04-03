'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

router.use(authenticateJWT);

router.get('/',    getEvents);
router.get('/:id', getEventById);
router.post('/', authorizeRole('admin'), validateBody(['title','start_date']), createEvent);
router.put('/:id',    authorizeRole('admin'), updateEvent);
router.delete('/:id', authorizeRole('admin'), deleteEvent);

module.exports = router;
