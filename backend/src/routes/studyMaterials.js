'use strict';
const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { getStudyMaterials, getStudyMaterialById, createStudyMaterial, deleteStudyMaterial } = require('../controllers/studyMaterialController');

router.use(authenticateJWT);

router.get('/',    getStudyMaterials);
router.get('/:id', getStudyMaterialById);
router.post('/', authorizeRole('teacher'), validateBody(['class_subject_id','title','file_url']), createStudyMaterial);
router.delete('/:id', authorizeRole('teacher','admin'), deleteStudyMaterial);

module.exports = router;
