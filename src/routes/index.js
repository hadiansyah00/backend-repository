const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const prodiRoutes = require('./prodi');
const docTypeRoutes = require('./docTypes');
const roleRoutes = require('./roles');
const repositoryRoutes = require('./repositories');
const dashboardRoutes = require('./dashboard');

// Register routes
router.use('/auth', authRoutes);
router.use('/doc-types', docTypeRoutes);
router.use('/prodi', prodiRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
