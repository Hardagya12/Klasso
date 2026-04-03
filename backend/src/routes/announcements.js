'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} = require('../controllers/announcementController');

router.use(authenticateJWT);

router.get('/', validatePagination, getAllAnnouncements);
router.post('/', authorizeRole('admin','teacher'), validateBody(['title','body']), createAnnouncement);
router.put('/:id', authorizeRole('admin','teacher'), updateAnnouncement);
router.delete('/:id', authorizeRole('admin'), deleteAnnouncement);

module.exports = router;
