const jwt = require('jsonwebtoken');
const db = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Akses ditolak: Token tidak valid atau tidak disediakan.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Dapatkan user dengan role dan prodi (exclude password)
    const user = await db.User.findByPk(decoded.id, {
      include: [
        { model: db.Role, as: 'role' },
        { model: db.ProgramStudi, as: 'prodi' }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Token valid, namun user tidak ditemukan' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Akun Anda sedang dinonaktifkan.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token Kadaluarsa. Silakan login kembali.' });
    }
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = { verifyToken };
