const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(verifyToken);
router.use(authorize('manage_users'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
