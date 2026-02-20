const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  login,
  register,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Validation middleware generator
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status(400).json({ success: false, errors: errors.array() });
  };
};

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication & user session
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticate user and return JWT access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@mail.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  validate([
    check('email', 'Tolong masukkan email yang valid').isEmail(),
    check('password', 'Password diperlukan').exists(),
  ]),
  login
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user baru
 *     description: Create new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hadi Hadiansyah
 *               email:
 *                 type: string
 *                 example: hadi@mail.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/register',
  validate([
    check('name', 'Nama diperlukan').not().isEmpty(),
    check('email', 'Tolong masukkan email yang valid').isEmail(),
    check('password', 'Password minimal 6 karakter').isLength({ min: 6 }),
  ]),
  register
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', verifyToken, getMe);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nama Baru
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  '/profile',
  verifyToken,
  validate([
    check('name', 'Nama tidak boleh kosong').optional().not().isEmpty(),
  ]),
  updateProfile
);

/**
 * @swagger
 * /auth/password:
 *   put:
 *     tags: [Auth]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Validation error
 */
router.put(
  '/password',
  verifyToken,
  validate([
    check('currentPassword', 'Password saat ini diperlukan').exists(),
    check('newPassword', 'Password baru minimal 6 karakter').isLength({ min: 6 }),
  ]),
  changePassword
);

module.exports = router;