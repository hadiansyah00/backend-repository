const { Repository, User, DownloadLog, ProgramStudi, sequelize } = require('../models');
const { getSixMonthLineData } = require('../utils/statsHelper');

exports.getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user?.role?.slug;
    const userId = req.user?.id;

    // --- MAHASISWA & DOSEN SPECIFIC STATS ---
    if (userRole === 'mahasiswa' || userRole === 'dosen') {
      const totalPublished = await Repository.count({ 
        where: { uploaded_by: userId, status: 'published' } 
      });
      const pendingReview = await Repository.count({ 
        where: { uploaded_by: userId, status: 'pending review' } 
      });
      const totalDrafts = await Repository.count({ 
        where: { uploaded_by: userId, status: 'draft' } 
      });
      const totalRejected = await Repository.count({ 
        where: { uploaded_by: userId, status: 'rejected' } 
      });

      return res.json({
        success: true,
        stats: {
          totalPublished,
          pendingReview,
          totalDrafts,
          totalRejected
        },
        barData: [], // Hide charts for students
        lineData: []
      });
    }

    // --- GLOBAL ADMIN STATS ---
    // 1. Total Published Repositories
    const totalPublished = await Repository.count({ where: { status: 'published' } });

    // 2. Pending Approval Repositories
    const pendingReview = await Repository.count({ where: { status: 'pending review' } });

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

    // 6. Real Line Data for Kunjungan & Unduhan (Last 6 Months)
    const lineData = await getSixMonthLineData();

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
