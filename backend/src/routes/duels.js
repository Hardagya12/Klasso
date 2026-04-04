const express = require('express');
const router = express.Router();
const duelController = require('../controllers/duelController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', requireRole(['TEACHER', 'ADMIN', 'SUPER_ADMIN']), duelController.createDuel);
router.get('/:id/results', duelController.getDuelResults);
router.get('/class/:classId', requireRole(['TEACHER', 'ADMIN', 'SUPER_ADMIN']), duelController.getClassDuels);

module.exports = router;
