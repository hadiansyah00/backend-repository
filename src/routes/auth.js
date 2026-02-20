const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { login, register, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Validation middleware generator
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// @route   POST /api/auth/login
router.post('/login', validate([
  check('email', 'Tolong masukkan email yang valid').isEmail(),
  check('password', 'Password diperlukan').exists()
]), login);

// @route   POST /api/auth/register
router.post('/register', validate([
  check('name', 'Nama diperlukan').not().isEmpty(),
  check('email', 'Tolong masukkan email yang valid').isEmail(),
  check('password', 'Password minimal 6 karakter').isLength({ min: 6 })
]), register);

// @route   GET /api/auth/me
router.get('/me', verifyToken, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', verifyToken, validate([
  check('name', 'Nama tidak boleh kosong').optional().not().isEmpty()
]), updateProfile);

// @route   PUT /api/auth/password
router.put('/password', verifyToken, validate([
  check('currentPassword', 'Password saat ini diperlukan').exists(),
  check('newPassword', 'Password baru minimal 6 karakter').isLength({ min: 6 })
]), changePassword);

module.exports = router;
