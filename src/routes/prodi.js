const express = require('express');
const router = express.Router();
const {
  getProdis,
  createProdi,
  updateProdi,
  deleteProdi,
} = require('../controllers/prodiController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Program Studi
 *     description: Master data program studi (used for dropdowns & academic reference)
 */

/**
 * @swagger
 * /prodi:
 *   get:
 *     tags: [Program Studi]
 *     summary: Get all program studi
 *     description: Retrieve list of program studi. Accessible by any authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Program studi retrieved successfully
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
 *                       kode:
 *                         type: string
 *                         example: D3-KB
 *                       nama:
 *                         type: string
 *                         example: D3 Kebidanan
 *       401:
 *         description: Unauthorized
 */
router.get('/', getProdis);

/**
 * @swagger
 * /prodi:
 *   post:
 *     tags: [Program Studi]
 *     summary: Create program studi
 *     description: Create new program studi. Requires **manage_master_data** permission.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kode, nama]
 *             properties:
 *               kode:
 *                 type: string
 *                 example: S1-GZ
 *               nama:
 *                 type: string
 *                 example: S1 Gizi
 *     responses:
 *       201:
 *         description: Program studi created successfully
 *       403:
 *         description: Forbidden (missing permission)
 */
router.post('/', authorize('manage_master_data'), createProdi);

/**
 * @swagger
 * /prodi/{id}:
 *   put:
 *     tags: [Program Studi]
 *     summary: Update program studi
 *     description: Update program studi by ID. Requires **manage_master_data** permission.
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
 *               kode:
 *                 type: string
 *                 example: S1-FR
 *               nama:
 *                 type: string
 *                 example: S1 Farmasi
 *     responses:
 *       200:
 *         description: Program studi updated successfully
 *       403:
 *         description: Forbidden (missing permission)
 *       404:
 *         description: Program studi not found
 */
router.put('/:id', authorize('manage_master_data'), updateProdi);

/**
 * @swagger
 * /prodi/{id}:
 *   delete:
 *     tags: [Program Studi]
 *     summary: Delete program studi
 *     description: Delete program studi by ID. Requires **manage_master_data** permission.
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
 *         description: Program studi deleted successfully
 *       403:
 *         description: Forbidden (missing permission)
 *       404:
 *         description: Program studi not found
 */
router.delete('/:id', authorize('manage_master_data'), deleteProdi);

module.exports = router;