'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const { getInbox, getSent, getMessageById, sendMessage, markRead, deleteMessage, getContacts } = require('../controllers/messageController');

router.use(authenticateJWT);

// Static paths before /:id
router.get('/inbox',    validatePagination, getInbox);
router.get('/sent',     validatePagination, getSent);
router.get('/contacts', getContacts);

router.get('/:id',         getMessageById);
router.post('/',           validateBody(['recipient_id','body']), sendMessage);
router.put('/:id/read',    markRead);
router.delete('/:id',      deleteMessage);

module.exports = router;
