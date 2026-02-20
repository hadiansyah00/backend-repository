const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard statistics & summary
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     description: Retrieve summary statistics for dashboard overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 120
 *                     totalRepositories:
 *                       type: integer
 *                       example: 45
 *                     totalDownloads:
 *                       type: integer
 *                       example: 320
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', verifyToken, dashboardController.getDashboardStats);

module.exports = router;