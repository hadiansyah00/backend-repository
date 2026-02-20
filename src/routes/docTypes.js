const express = require('express');
const router = express.Router();
const { getDocTypes, createDocType, updateDocType, deleteDocType } = require('../controllers/docTypeController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);

// GET is accessible by any authenticated user for dropdowns
router.get('/', getDocTypes);

// Writes require manage_master_data
router.post('/', authorize('manage_master_data'), createDocType);
router.put('/:id', authorize('manage_master_data'), updateDocType);
router.delete('/:id', authorize('manage_master_data'), deleteDocType);

module.exports = router;
