const express = require('express');
const router = express.Router();
const {
  getRepositories,
  getRepositoryById,
  createRepository,
  updateRepository,
  deleteRepository,
  downloadRepository
} = require('../controllers/repositoryController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const upload = require('../middleware/upload');

// Semua route memerlukan autentikasi
router.use(verifyToken);

// GET — accessible by any authenticated user
router.get('/', getRepositories);
router.get('/:id', getRepositoryById);
router.get('/:id/download', downloadRepository);

// POST, PUT, DELETE — require manage_repositories permission
router.post('/', authorize('manage_repositories'), upload.single('file'), createRepository);
router.put('/:id', authorize('manage_repositories'), updateRepository);
router.delete('/:id', authorize('manage_repositories'), deleteRepository);

module.exports = router;
