const db = require('../models');

// @desc    Get all Roles along with their permissions
// @route   GET /api/roles
// @access  Private (manage_roles)
const getRoles = async (req, res) => {
  try {
    const roles = await db.Role.findAll({
      include: [
        {
          model: db.Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'description'],
          through: { attributes: [] } // Sembunyikan data table junction
        }
      ],
      order: [['id', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all available permissions list
// @route   GET /api/roles/permissions
// @access  Private (manage_roles)
const getPermissions = async (req, res) => {
  try {
    const permissions = await db.Permission.findAll();
    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update permissions for a specific role
// @route   PUT /api/roles/:id/permissions
// @access  Private (manage_roles)
const updateRolePermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { permissionIds, permissions } = req.body; // Array of permission IDs or names

    // Frontend might send 'permissions' array instead of 'permissionIds' in RoleService
    const inputPerms = permissionIds || permissions || [];

    const role = await db.Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role tidak ditemukan' });
    }

    if (role.slug === 'super-admin') {
      return res.status(403).json({ message: 'Super Admin permissions tidak dapat diubah' });
    }

    let finalPermissionIds = inputPerms;
    if (inputPerms.length > 0 && isNaN(inputPerms[0])) {
      // Jika yang dikirim adalah string name (misal: 'manage_users')
      const perms = await db.Permission.findAll({
        where: { name: inputPerms }
      });
      finalPermissionIds = perms.map(p => p.id);
    }

    // Set auto-replaces existing associations in junction table
    await role.setPermissions(finalPermissionIds);

    const updatedRole = await db.Role.findByPk(roleId, {
      include: [
        {
          model: db.Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'description'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({ message: 'Permissions berhasil diupdate', role: updatedRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getRoles, getPermissions, updateRolePermissions };
