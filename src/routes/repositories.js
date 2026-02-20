const express = require('express');
const router = express.Router();
const {
  getRepositories,
  getRepositoryById,
  createRepository,
  updateRepository,
  deleteRepository,
  downloadRepository,
  approveRepository,
  rejectRepository,
} = require('../controllers/repositoryController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const upload = require('../middleware/upload');

// Semua route memerlukan autentikasi
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Repositories
 *     description: File repository management (upload, download, metadata)
 */

/**
 * @swagger
 * /repositories:
 *   get:
 *     tags: [Repositories]
 *     summary: Get all repositories
 *     description: Retrieve all repositories accessible by authenticated users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of repositories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Modul Farmasi
 *                       filename:
 *                         type: string
 *                         example: modul-farmasi.pdf
 */
router.get('/', getRepositories);

/**
 * @swagger
 * /repositories/{id}:
 *   get:
 *     tags: [Repositories]
 *     summary: Get repository detail
 *     description: Retrieve repository detail by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Repository detail
 *       404:
 *         description: Repository not found
 */
router.get('/:id', getRepositoryById);

/**
 * @swagger
 * /repositories/{id}/download:
 *   get:
 *     tags: [Repositories]
 *     summary: Download repository file
 *     description: Download repository file by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: File not found
 */
router.get('/:id/download', downloadRepository);

/**
 * @swagger
 * /repositories:
 *   post:
 *     tags: [Repositories]
 *     summary: Create repository
 *     description: Upload a new repository file. Requires **manage_repositories** permission.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, file]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Modul Kebidanan
 *               description:
 *                 type: string
 *                 example: Modul pembelajaran semester 1
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Repository created successfully
 *       403:
 *         description: Forbidden (missing permission)
 */
router.post(
  '/',
  authorize('manage_repositories'),
  upload.single('file'),
  createRepository
);

/**
 * @swagger
 * /repositories/{id}:
 *   put:
 *     tags: [Repositories]
 *     summary: Update repository
 *     description: Update repository metadata by ID. Requires **manage_repositories** permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Modul Farmasi Update
 *               description:
 *                 type: string
 *                 example: Versi terbaru
 *     responses:
 *       200:
 *         description: Repository updated successfully
 *       403:
 *         description: Forbidden (missing permission)
 *       404:
 *         description: Repository not found
 */
router.put('/:id', authorize('manage_repositories'), updateRepository);

/**
 * @swagger
 * /repositories/{id}:
 *   delete:
 *     tags: [Repositories]
 *     summary: Delete repository
 *     description: Delete repository by ID. Requires **manage_repositories** permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Repository deleted successfully
 *       403:
 *         description: Forbidden (missing permission)
 *       404:
 *         description: Repository not found
 */
router.delete('/:id', authorize('manage_repositories'), deleteRepository);
/**
 * @swagger
 * /repositories/{id}/approve:
 *   put:
 *     tags: [Repositories]
 *     summary: Approve repository
 *     description: Approve a pending repository and set its status to published. Requires **approve_repo** permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Repository approved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id/approve', authorize('approve_repo'), approveRepository);

/**
 * @swagger
 * /repositories/{id}/reject:
 *   put:
 *     tags: [Repositories]
 *     summary: Reject repository
 *     description: Reject a pending repository. Requires **approve_repo** permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: Revisi abstrak
 *     responses:
 *       200:
 *         description: Repository rejected
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id/reject', authorize('approve_repo'), rejectRepository);

module.exports = router;