const express = require('express');
const router = express.Router();
const { getRoles, getPermissions, updateRolePermissions } = require('../controllers/roleController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);
router.use(authorize('manage_roles'));

router.get('/', getRoles);
router.get('/permissions', getPermissions);
router.put('/:id/permissions', updateRolePermissions);

module.exports = router;
