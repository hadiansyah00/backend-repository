const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const prodiRoutes = require('./prodi');
const docTypeRoutes = require('./docTypes');
const roleRoutes = require('./roles');
const repositoryRoutes = require('./repositories');
const dashboardRoutes = require('./dashboard');

/**
 * @swagger
 * tags:
 *   - name: API Overview
 *     description: Entry point and module mapping for the API
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [API Overview]
 *     summary: API root
 *     description: |
 *       Repository Management API.
 *
 *       Available modules:
 *       - **Auth** → Authentication & profile
 *       - **Users** → User management (admin)
 *       - **Program Studi** → Master data program studi
 *       - **Document Types** → Master data document types
 *       - **Roles** → Role & permission management
 *       - **Repositories** → File repository management
 *       - **Dashboard** → Statistics & overview
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
  });
});

// Register routes
router.use('/auth', authRoutes);
router.use('/doc-types', docTypeRoutes);
router.use('/prodi', prodiRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;