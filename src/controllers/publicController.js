const fs = require('fs');
const { Repository, User, DownloadLog, ProgramStudi, DocType, sequelize, Sequelize } = require('../models');
const { getSixMonthLineData } = require('../utils/statsHelper');
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

    // 6. Real Line Data for Kunjungan & Unduhan (Last 6 Months)
    const lineData = await getSixMonthLineData();

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

exports.getPublicRepositoryById = async (req, res) => {
  try {
    const repository = await Repository.findByPk(req.params.id, {
      include: [
        { model: ProgramStudi, as: 'prodi', attributes: ['id', 'name', 'code'] },
        { model: DocType, as: 'docType', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] } // Just returning uploader email/name is generally okay for transparency, but omit password/role
      ]
    });

    if (!repository) {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    // Hanya repo published yang bisa diakses public
    if (repository.status !== 'published') {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    const downloadCount = await DownloadLog.count({
      where: { repository_id: repository.id }
    });

    // We send back everything. The frontend handles logic to hide download button if 'private' or 'restricted'
    res.json({
      ...repository.toJSON(),
      download_count: downloadCount
    });
  } catch (error) {
    console.error('Error fetching public repository by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.downloadPublicRepository = async (req, res) => {
  try {
    const repository = await Repository.findByPk(req.params.id);
    
    if (!repository || repository.status !== 'published') {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    if (!repository.file_path || !fs.existsSync(repository.file_path)) {
      return res.status(404).json({ message: 'File tidak ditemukan di server' });
    }

    // Enforce Access rules
    if (repository.access_level === 'private' || repository.access_level === 'restricted') {
      return res.status(401).json({ message: 'Akses terbatas. Harap login uktuk melihat atau mengunduh dokumen ini.' });
    }
    
    // Access Level is Public: stream without auth
    // Buat download log (user_id is null for anonymous public downloads)
    await DownloadLog.create({
      repository_id: repository.id,
      user_id: null
    });

    res.download(repository.file_path, repository.file_name);

  } catch (error) {
    console.error('Error downloading public repository:', error);
    res.status(500).json({ message: 'Server Error' });
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

exports.getPublicDocTypes = async (req, res) => {
  try {
    const docTypes = await DocType.findAll({
      where: {
        is_active: true
      },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: docTypes });
  } catch (error) {
    console.error('Error fetching public doc types:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
