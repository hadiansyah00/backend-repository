const express = require('express');
const router = express.Router();
const { getProdis, createProdi, updateProdi, deleteProdi } = require('../controllers/prodiController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);

// GET is accessible by any authenticated user for dropdowns
router.get('/', getProdis);

// Writes require manage_master_data
router.post('/', authorize('manage_master_data'), createProdi);
router.put('/:id', authorize('manage_master_data'), updateProdi);
router.delete('/:id', authorize('manage_master_data'), deleteProdi);

module.exports = router;
