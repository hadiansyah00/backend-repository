const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

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

module.exports = router;
