const express = require('express');
const router = express.Router();
const {
  getDocTypes,
  createDocType,
  updateDocType,
  deleteDocType,
} = require('../controllers/docTypeController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Document Types
 *     description: Master data for document types (used for dropdowns & validation)
 */

/**
 * @swagger
 * /doc-types:
 *   get:
 *     tags: [Document Types]
 *     summary: Get all document types
 *     description: Retrieve all document types. Accessible by any authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document types retrieved successfully
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
 *                       name:
 *                         type: string
 *                         example: Ijazah
 *       401:
 *         description: Unauthorized
 */
router.get('/', getDocTypes);

/**
 * @swagger
 * /doc-types:
 *   post:
 *     tags: [Document Types]
 *     summary: Create a new document type
 *     description: Create a new document type. Requires **manage_master_data** permission.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Transkrip Nilai
 *     responses:
 *       201:
 *         description: Document type created successfully
 *       403:
 *         description: Forbidden (missing permission)
 */
router.post('/', authorize('manage_master_data'), createDocType);

/**
 * @swagger
 * /doc-types/{id}:
 *   put:
 *     tags: [Document Types]
 *     summary: Update document type
 *     description: Update document type by ID. Requires **manage_master_data** permission.
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kartu Keluarga
 *     responses:
 *       200:
 *         description: Document type updated successfully
 *       403:
 *         description: Forbidden (missing permission)
 *       404:
 *         description: Document type not found
 */
router.put('/:id', authorize('manage_master_data'), updateDocType);

/**
 * @swagger
 * /doc-types/{id}:
 *   delete:
 *     tags: [Document Types]
 *     summary: Delete document type
 *     description: Delete document type by ID. Requires **manage_master_data** permission.
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
 *         description: Document type deleted successfully
 *       403:
 *         description: Forbidden (missing permission)
 *       404:
 *         description: Document type not found
 */
router.delete('/:id', authorize('manage_master_data'), deleteDocType);

module.exports = router;