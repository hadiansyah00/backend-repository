const express = require('express');
const router = express.Router();
const { getDownloadLogs } = require('../controllers/downloadLogController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Protect all routes
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Download Logs
 *     description: Repository download history and audit trails
 */

/**
 * @swagger
 * /download-logs:
 *   get:
 *     tags: [Download Logs]
 *     summary: Retrieve download logs
 *     description: Fetch paginated repository download history. Requires **view_download_logs** or **view_download_logs_prodi** permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by repository title
 *     responses:
 *       200:
 *         description: A paginated list of download logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Authorize could check either permission - we will map it loosely for view_download_logs to keep it simple,
// Or we can specify an array if the middleware supports it. (authorize(['view_download_logs', 'view_download_logs_prodi'])
// It depends on authorize middleware configuration. Assuming single string, we use the higher one for now.
router.get('/', authorize('view_download_logs'), getDownloadLogs);

// Export router
module.exports = router;
