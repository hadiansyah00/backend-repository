const db = require('../models');

// @desc    Get all users (with pagination & search)
// @route   GET /api/users
// @access  Private (manage_users)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || 'All';

    let whereClause = {};
    
    // Search by name or nip or email
    if (search) {
      whereClause = {
        ...whereClause,
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { email: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { nip: { [db.Sequelize.Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const includeRole = { model: db.Role, as: 'role' };
    if (role !== 'All') {
      includeRole.where = { name: role };
    }

    const { count, rows } = await db.User.findAndCountAll({
      where: whereClause,
      include: [
        includeRole,
        { model: db.ProgramStudi, as: 'prodi' }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new user (Admin)
// @route   POST /api/users
// @access  Private (manage_users)
const createUser = async (req, res) => {
  try {
    const { name, email, password, nip, role, prodi, status, role_id, prodi_id } = req.body;

    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // Resolve Role ID
    let finalRoleId = role_id;
    if (!finalRoleId && role) {
      const roleRecord = await db.Role.findOne({ where: { name: role } });
      if (roleRecord) finalRoleId = roleRecord.id;
    }
    if (!finalRoleId) return res.status(400).json({ message: 'Role tidak valid' });

    // Resolve Prodi ID
    let finalProdiId = prodi_id || null;
    if (prodi_id === "") finalProdiId = null; // empty string safeguard
    if (!finalProdiId && prodi && prodi !== 'All' && prodi !== '') {
      const prodiRecord = await db.ProgramStudi.findOne({ where: { name: prodi } });
      if (prodiRecord) finalProdiId = prodiRecord.id;
    }

    const user = await db.User.create({
      name,
      email,
      password: password || '123456', // Default password jika kosong
      nip,
      role_id: finalRoleId,
      prodi_id: finalProdiId,
      status: status || 'active'
    });

    const userWithRelations = await db.User.findByPk(user.id, {
      include: ['role', 'prodi']
    });

    res.status(201).json({ message: 'User berhasil dibuat', user: userWithRelations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (manage_users)
const updateUser = async (req, res) => {
  try {
    const { name, email, nip, role, prodi, status, password, role_id, prodi_id } = req.body;
    let user = await db.User.scope('withPassword').findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cek duplikasi email
    if (email !== user.email) {
      const emailExists = await db.User.findOne({ where: { email } });
      if (emailExists) return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
      user.email = email;
    }

    // Role resolution
    if (role_id) {
       user.role_id = role_id;
    } else if (role) {
      const roleRecord = await db.Role.findOne({ where: { name: role } });
      if (roleRecord) user.role_id = roleRecord.id;
    }

    // Prodi resolution
    if (prodi_id !== undefined) {
      user.prodi_id = prodi_id === "" ? null : prodi_id;
    } else if (prodi !== undefined) {
      if (prodi === 'All' || prodi === '') {
        user.prodi_id = null;
      } else {
        const prodiRecord = await db.ProgramStudi.findOne({ where: { name: prodi } });
        if (prodiRecord) user.prodi_id = prodiRecord.id;
      }
    }

    user.name = name || user.name;
    user.nip = nip !== undefined ? nip : user.nip;
    user.status = status || user.status;
    if (password) user.password = password;

    await user.save();
    
    // Refresh for response (exclude password)
    const updatedUser = await db.User.findByPk(user.id, { include: ['role', 'prodi']});

    res.json({ message: 'User berhasil diupdate', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (manage_users)
const deleteUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    if (user.email === 'admin@example.com' || user.id === req.user.id) {
      return res.status(403).json({ message: 'Tidak dapat menghapus super admin atau diri sendiri' });
    }

    await user.destroy();
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
