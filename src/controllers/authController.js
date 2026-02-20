const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Default scope excludes password, we need it to verify
    const user = await db.User.scope('withPassword').findOne({
      where: { email },
      include: [
        { model: db.Role, as: 'role' },
        { model: db.ProgramStudi, as: 'prodi' }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Email tidak terdaftar.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah.' });
    }

    // Prepare clean user data for response
    const userData = user.toJSON();
    delete userData.password;

    res.json({
      message: 'Login berhasil',
      token: generateToken(user.id),
      user: userData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, nip, prodi_id } = req.body;

    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Email sudah digunakan.' });
    }

    // Default role 'mahasiswa', jika tidak dispesifikkan di request nanti bisa disesuaikan,
    // Di aplikasi real, register public biasanya di-set ke role Mahasiswa otomatis
    const role = await db.Role.findOne({ where: { slug: 'mahasiswa' } });
    if (!role) {
      return res.status(500).json({ message: 'Sistem belum dikonfigurasi sepenuhnya (Role Mahasiswa tidak ada)' });
    }

    const user = await db.User.create({
      name,
      email,
      password,
      nip: nip || null,
      role_id: role.id,
      prodi_id: prodi_id || null, // null = Belum Ditentukan
      status: 'active'
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role.name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error saat register' });
  }
};

// @desc    Get current logged in user & permissions
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user has been populated by verifyToken middleware
    const user = req.user.toJSON();
    
    // Ambil daftar jaring permissions milik role
    const rolePermissions = await db.Role.findByPk(user.role_id, {
      include: [{ model: db.Permission, as: 'permissions', attributes: ['name'] }]
    });

    const permissions = rolePermissions && rolePermissions.permissions 
      ? rolePermissions.permissions.map(p => p.name) 
      : [];

    user.permissions = permissions;

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile data
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, nip } = req.body;
    const user = await db.User.findByPk(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.nip = nip !== undefined ? nip : user.nip; // Bisa dikosongkan

      const updatedUser = await user.save();
      res.json({
        message: 'Profile berhasil diperbarui',
        user: updatedUser
      });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Harap isikan password saat ini dan password baru' });
    }

    const user = await db.User.scope('withPassword').findByPk(req.user.id);
    
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password saat ini salah' });
    }

    user.password = newPassword; // akan di-hash oleh model hooks
    await user.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  login,
  register,
  getMe,
  updateProfile,
  changePassword
};
