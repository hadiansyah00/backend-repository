const { Repository, User, DownloadLog, ProgramStudi, sequelize } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Published Repositories
    const totalPublished = await Repository.count({ where: { status: 'published' } });

    // 2. Pending Approval Repositories (we use 'draft' as pending since there's no 'pending review' in enum)
    const pendingReview = await Repository.count({ where: { status: 'draft' } });

    // 3. Total Users
    const totalUsers = await User.count();

    // 4. Total Downloads
    const totalDownloads = await DownloadLog.count();

    // 5. Document per Prodi
    const docsPerProdi = await ProgramStudi.findAll({
      attributes: ['name'],
      include: [{
        model: Repository,
        as: 'repositories',
        attributes: [],
      }],
      group: ['ProgramStudi.id'],
      attributes: [
        'name',
        [sequelize.fn('COUNT', sequelize.col('repositories.id')), 'total']
      ]
    });

    // We can format the prodi data for Recharts (BarChart)
    const barData = docsPerProdi.map(p => ({
      name: p.name,
      total: parseInt(p.dataValues.total, 10) || 0
    })).filter(p => p.total > 0); // optional: only show prodi with > 0 docs

    // 6. Mocked Line Data for Kunjungan & Unduhan since tracking daily views isn't fully in DB yet
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
        pendingReview,
        totalUsers,
        totalDownloads
      },
      barData,
      lineData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data statistik dashboard.', error: error.message });
  }
};
