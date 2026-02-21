const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const visitTracker = require('../middleware/visitTracker');

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Public endpoints for home page and unauthenticated access
 */

/**
 * @swagger
 * /public/stats:
 *   get:
 *     tags: [Public]
 *     summary: Get public dashboard statistics
 *     description: Retrieve summary statistics for public overview
 *     responses:
 *       200:
 *         description: Public statistics retrieved successfully
 */
router.get('/stats', publicController.getPublicStats);

/**
 * @swagger
 * /public/repositories:
 *   get:
 *     tags: [Public]
 *     summary: Get public repositories
 *     description: Retrieve all published repositories
 *     responses:
 *       200:
 *         description: List of published repositories
 */
router.get('/repositories', publicController.getPublicRepositories);

/**
 * @swagger
 * /public/repositories/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Get public repository detail
 *     description: Retrieve repository detail by ID (only published)
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
router.get('/repositories/:id', visitTracker, publicController.getPublicRepositoryById);

/**
 * @swagger
 * /public/repositories/{id}/download:
 *   get:
 *     tags: [Public]
 *     summary: Download public repository file
 *     description: Download repository file if access_level is public
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: File stream
 *       401:
 *         description: Restricted access (needs login)
 *       404:
 *         description: Repository or file not found
 */
router.get('/repositories/:id/download', publicController.downloadPublicRepository);

/**
 * @swagger
 * /public/prodi:
 *   get:
 *     tags: [Public]
 *     summary: Get active Program Studi
 *     description: Retrieve all active program studi for registration dropdown
 *     responses:
 *       200:
 *         description: List of active program studi
 */
router.get('/prodi', publicController.getPublicProdis);

/**
 * @swagger
 * /public/doc-types:
 *   get:
 *     tags: [Public]
 *     summary: Get active Document Types
 *     description: Retrieve all active document types for public filters
 *     responses:
 *       200:
 *         description: List of active document types
 */
router.get('/doc-types', publicController.getPublicDocTypes);

module.exports = router;
