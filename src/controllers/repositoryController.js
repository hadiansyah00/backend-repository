const db = require('../models');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// @desc    Get all repositories (paginated, with filters)
// @route   GET /api/repositories
// @access  Private (Authenticated)
const getRepositories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      prodi_id,
      doc_type_id,
      search,
      status
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause dynamically
    const where = {};
    if (prodi_id) where.prodi_id = prodi_id;
    if (doc_type_id) where.doc_type_id = doc_type_id;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await db.Repository.findAndCountAll({
      where,
      include: [
        { model: db.ProgramStudi, as: 'prodi', attributes: ['id', 'name', 'code'] },
        { model: db.DocType, as: 'docType', attributes: ['id', 'name', 'slug'] },
        { model: db.User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single repository detail
// @route   GET /api/repositories/:id
// @access  Private (Authenticated)
const getRepositoryById = async (req, res) => {
  try {
    const repository = await db.Repository.findByPk(req.params.id, {
      include: [
        { model: db.ProgramStudi, as: 'prodi', attributes: ['id', 'name', 'code'] },
        { model: db.DocType, as: 'docType', attributes: ['id', 'name', 'slug'] },
        { model: db.User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!repository) {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    // Hitung jumlah download
    const downloadCount = await db.DownloadLog.count({
      where: { repository_id: repository.id }
    });

    res.json({
      ...repository.toJSON(),
      download_count: downloadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new repository (upload file + metadata)
// @route   POST /api/repositories
// @access  Private (manage_repositories)
const createRepository = async (req, res) => {
  try {
    const { title, abstract, author, year, prodi_id, doc_type_id, status } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File wajib diunggah' });
    }

    if (!title || !author) {
      // Hapus file yang sudah terupload jika validasi gagal
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Field title dan author wajib diisi' });
    }

    const repository = await db.Repository.create({
      title,
      abstract: abstract || null,
      author,
      year: year ? parseInt(year) : null,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
      status: status || 'draft',
      prodi_id: prodi_id || null,
      doc_type_id: doc_type_id || null,
      uploaded_by: req.user.id
    });

    // Reload with associations
    const result = await db.Repository.findByPk(repository.id, {
      include: [
        { model: db.ProgramStudi, as: 'prodi', attributes: ['id', 'name', 'code'] },
        { model: db.DocType, as: 'docType', attributes: ['id', 'name', 'slug'] },
        { model: db.User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({ message: 'Repository berhasil ditambahkan', repository: result });
  } catch (error) {
    // Hapus file jika terjadi error saat create
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update repository metadata
// @route   PUT /api/repositories/:id
// @access  Private (manage_repositories)
const updateRepository = async (req, res) => {
  try {
    const { title, abstract, author, year, status, prodi_id, doc_type_id } = req.body;

    const repository = await db.Repository.findByPk(req.params.id);
    if (!repository) {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    if (title !== undefined) repository.title = title;
    if (abstract !== undefined) repository.abstract = abstract;
    if (author !== undefined) repository.author = author;
    if (year !== undefined) repository.year = parseInt(year);
    if (status !== undefined) repository.status = status;
    if (prodi_id !== undefined) repository.prodi_id = prodi_id;
    if (doc_type_id !== undefined) repository.doc_type_id = doc_type_id;

    await repository.save();

    // Reload with associations
    const result = await db.Repository.findByPk(repository.id, {
      include: [
        { model: db.ProgramStudi, as: 'prodi', attributes: ['id', 'name', 'code'] },
        { model: db.DocType, as: 'docType', attributes: ['id', 'name', 'slug'] },
        { model: db.User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({ message: 'Repository berhasil diperbarui', repository: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete/Soft-delete repository & file fisik
// @route   DELETE /api/repositories/:id
// @access  Private (manage_repositories)
const deleteRepository = async (req, res) => {
  try {
    const repository = await db.Repository.findByPk(req.params.id);
    if (!repository) {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    // Hapus file fisik jika masih ada
    if (repository.file_path && fs.existsSync(repository.file_path)) {
      fs.unlinkSync(repository.file_path);
    }

    // Soft-delete: ubah status menjadi archived
    repository.status = 'archived';
    await repository.save();

    res.json({ message: `Repository "${repository.title}" berhasil dihapus (archived)` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download file repository & create download log
// @route   GET /api/repositories/:id/download
// @access  Private (Authenticated)
const downloadRepository = async (req, res) => {
  try {
    const repository = await db.Repository.findByPk(req.params.id);
    if (!repository) {
      return res.status(404).json({ message: 'Repository tidak ditemukan' });
    }

    if (!repository.file_path || !fs.existsSync(repository.file_path)) {
      return res.status(404).json({ message: 'File tidak ditemukan di server' });
    }

    // Buat download log
    await db.DownloadLog.create({
      repository_id: repository.id,
      user_id: req.user.id
    });

    // Stream file ke client
    res.download(repository.file_path, repository.file_name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getRepositories,
  getRepositoryById,
  createRepository,
  updateRepository,
  deleteRepository,
  downloadRepository
};
