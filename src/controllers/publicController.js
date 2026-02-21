const { Repository, User, DownloadLog, ProgramStudi, DocType, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getPublicStats = async (req, res) => {
  try {
    // 1. Total Published Repositories
    const totalPublished = await Repository.count({ where: { status: 'published' } });

    // 2. Total Users
    const totalUsers = await User.count();

    // 3. Total Downloads
    const totalDownloads = await DownloadLog.count();

    // 4. Document per Prodi
    const docsPerProdi = await ProgramStudi.findAll({
      attributes: ['name'],
      include: [{
        model: Repository,
        as: 'repositories',
        where: { status: 'published' },
        required: false,
        attributes: [],
      }],
      group: ['ProgramStudi.id'],
      attributes: [
        'name',
        [sequelize.fn('COUNT', sequelize.col('repositories.id')), 'total']
      ]
    });

    const barData = docsPerProdi.map(p => ({
      name: p.name,
      total: parseInt(p.dataValues.total, 10) || 0
    })).filter(p => p.total > 0);

    // Mocked Line Data
    const lineData = [
      { name: "Jan", views: 4000, downloads: 2400 },
      { name: "Feb", views: 3000, downloads: 1398 },
      { name: "Mar", views: 2000, downloads: 4800 },
      { name: "Apr", views: 2780, downloads: 3908 },
      { name: "May", views: 1890, downloads: 4800 },
      { name: "Jun", views: 2390, downloads: 3800 },
    ];

    res.json({
      success: true,
      stats: {
        totalPublished,
        totalUsers,
        totalDownloads
      },
      barData,
      lineData
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data statistik publik.', error: error.message });
  }
};

exports.getPublicRepositories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', doc_type_id, prodi_id } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: 'published' }; // Public ONLY sees published

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }
    if (prodi_id) where.prodi_id = prodi_id;
    if (doc_type_id) where.doc_type_id = doc_type_id;

    const { count, rows } = await Repository.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: ProgramStudi, as: 'prodi', attributes: ['id', 'name', 'code'] },
        { model: DocType, as: 'docType', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public repositories:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getPublicProdis = async (req, res) => {
  try {
    const prodis = await ProgramStudi.findAll({
      where: {
        status: 'Aktif'
      },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: prodis });
  } catch (error) {
    console.error('Error fetching public prodis:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
