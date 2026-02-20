const db = require('../models');

// Pastikan digunakan SETELAH verifyToken middleware
const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userRoleId = req.user.role_id;
      
      // Ambil role beserta jaring permissionnya
      const role = await db.Role.findByPk(userRoleId, {
        include: [{ 
          model: db.Permission, 
          as: 'permissions',
          attributes: ['name']
        }]
      });

      if (!role) {
        return res.status(403).json({ message: 'Role tidak ditemukan' });
      }

      const permissionsArray = role.permissions.map(p => p.name);

      if (!permissionsArray.includes(requiredPermission)) {
        return res.status(403).json({ 
          message: 'Akses ditolak: Anda tidak memiliki izin untuk tindakan ini',
          required: requiredPermission
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Server Error saat authorization' });
    }
  };
};

module.exports = { authorize };
