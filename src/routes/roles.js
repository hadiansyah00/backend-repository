const express = require('express');
const router = express.Router();
const {
  getRoles,
  getPermissions,
  updateRolePermissions,
} = require('../controllers/roleController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);
router.use(authorize('manage_roles'));

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Role & permission management
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     description: Retrieve list of all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
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
 *                         example: admin
 */
router.get('/', getRoles);

/**
 * @swagger
 * /roles/permissions:
 *   get:
 *     tags: [Roles]
 *     summary: Get all permissions
 *     description: Retrieve list of all available permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
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
 *                     type: string
 *                     example: manage_users
 */
router.get('/permissions', getPermissions);

/**
 * @swagger
 * /roles/{id}/permissions:
 *   put:
 *     tags: [Roles]
 *     summary: Update role permissions
 *     description: Assign or update permissions for a specific role
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
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - manage_users
 *                   - manage_repositories
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.put('/:id/permissions', updateRolePermissions);

module.exports = router;