'use strict';

const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { validateBody, validatePagination } = require('../middleware/validate');
const {
  getInbox, getSent, getMessageById, sendMessage, deleteMessage, markRead,
} = require('../controllers/messageController');

router.use(authenticateJWT);

router.get('/',       validatePagination, getInbox);
router.get('/sent',   validatePagination, getSent);
router.get('/:id',    getMessageById);
router.post('/',      validateBody(['recipient_id','body']), sendMessage);
router.delete('/:id', deleteMessage);
router.patch('/:id/read', markRead);

module.exports = router;
