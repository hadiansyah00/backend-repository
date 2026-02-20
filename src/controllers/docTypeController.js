const db = require('../models');

// @desc    Get all Doc Types
// @route   GET /api/doc-types
// @access  Private
const getDocTypes = async (req, res) => {
  try {
    const docTypes = await db.DocType.findAll({
      order: [['name', 'ASC']]
    });
    res.json(docTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create Doc Type
// @route   POST /api/doc-types
// @access  Private (manage_master_data)
const createDocType = async (req, res) => {
  try {
    const { name, slug, description, is_active } = req.body;

    const exists = await db.DocType.findOne({ where: { slug } });
    if (exists) {
      return res.status(400).json({ message: 'Slug jenis dokumen sudah digunakan' });
    }

    const docType = await db.DocType.create({
      name, slug, description, is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ message: 'Jenis Dokumen berhasil ditambahkan', docType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Doc Type
// @route   PUT /api/doc-types/:id
// @access  Private (manage_master_data)
const updateDocType = async (req, res) => {
  try {
    const { name, slug, description, is_active } = req.body;
    let docType = await db.DocType.findByPk(req.params.id);

    if (!docType) return res.status(404).json({ message: 'Jenis Dokumen tidak ditemukan' });

    if (slug && slug !== docType.slug) {
      const exists = await db.DocType.findOne({ where: { slug } });
      if (exists) return res.status(400).json({ message: 'Slug ini sudah dipakai' });
      docType.slug = slug;
    }

    if (name) docType.name = name;
    if (description !== undefined) docType.description = description;
    if (is_active !== undefined) docType.is_active = is_active;

    await docType.save();
    res.json({ message: 'Jenis Dokumen berhasil diperbarui', docType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete Doc Type
// @route   DELETE /api/doc-types/:id
// @access  Private (manage_master_data)
const deleteDocType = async (req, res) => {
  try {
    const docType = await db.DocType.findByPk(req.params.id);
    if (!docType) return res.status(404).json({ message: 'Jenis Dokumen tidak ditemukan' });

    await docType.destroy();
    res.json({ message: `Jenis dokumen ${docType.name} berhasil dihapus` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDocTypes, createDocType, updateDocType, deleteDocType };
