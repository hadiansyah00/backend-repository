const db = require('../models');

// @desc    Get all Program Studi
// @route   GET /api/prodi
// @access  Private
const getProdis = async (req, res) => {
  try {
    const prodis = await db.ProgramStudi.findAll({
      order: [['name', 'ASC']]
    });
    res.json(prodis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create Program Studi
// @route   POST /api/prodi
// @access  Private (manage_master_data)
const createProdi = async (req, res) => {
  try {
    const { name, code, head, status } = req.body;

    const exists = await db.ProgramStudi.findOne({ where: { code } });
    if (exists) {
      return res.status(400).json({ message: 'Kode Prodi sudah digunakan' });
    }

    const prodi = await db.ProgramStudi.create({
      name, code, head, status: status || 'Aktif'
    });

    res.status(201).json({ message: 'Program Studi berhasil ditambahkan', prodi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Program Studi
// @route   PUT /api/prodi/:id
// @access  Private (manage_master_data)
const updateProdi = async (req, res) => {
  try {
    const { name, code, head, status } = req.body;
    let prodi = await db.ProgramStudi.findByPk(req.params.id);

    if (!prodi) return res.status(404).json({ message: 'Program Studi tidak ditemukan' });

    if (code && code !== prodi.code) {
      const exists = await db.ProgramStudi.findOne({ where: { code } });
      if (exists) return res.status(400).json({ message: 'Kode Prodi ini sudah terdaftar' });
      prodi.code = code;
    }

    if (name) prodi.name = name;
    if (head !== undefined) prodi.head = head;
    if (status) prodi.status = status;

    await prodi.save();
    res.json({ message: 'Program Studi berhasil diperbarui', prodi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete Program Studi
// @route   DELETE /api/prodi/:id
// @access  Private (manage_master_data)
const deleteProdi = async (req, res) => {
  try {
    const prodi = await db.ProgramStudi.findByPk(req.params.id);
    if (!prodi) return res.status(404).json({ message: 'Program Studi tidak ditemukan' });

    await prodi.destroy();
    res.json({ message: `Program Studi ${prodi.name} berhasil dihapus` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getProdis, createProdi, updateProdi, deleteProdi };
