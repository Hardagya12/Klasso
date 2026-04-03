'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.use(authenticateJWT);

router.get('/',    getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', authorizeRole('admin','teacher'), validateBody(['title','body']), createAnnouncement);
router.put('/:id',    authorizeRole('admin','teacher'), updateAnnouncement);
router.delete('/:id', authorizeRole('admin'), deleteAnnouncement);

module.exports = router;
