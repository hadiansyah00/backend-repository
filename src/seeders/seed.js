const db = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // 1. Sinkronisasi DB (opsional, pastikan tabel sudah dibuat server.js / migrations)
    await db.sequelize.sync({ alter: true });
    
    // 2. Clear table (Uncomment jika ingin clean seed setiap kali run)
    // await db.User.destroy({ where: {} });
    // await db.Role.destroy({ where: {} });
    // await db.ProgramStudi.destroy({ where: {} });
    // await db.DocType.destroy({ where: {} });
    
    console.log('🌱 Seeding Roles...');
    const rolesData = [
      { name: 'Super Admin', slug: 'super-admin' },
      { name: 'Admin Prodi', slug: 'admin-prodi' },
      { name: 'Dosen / Reviewer', slug: 'dosen' },
      { name: 'Mahasiswa', slug: 'mahasiswa' }
    ];
    // Gunakan bulkCreate dengan ignoreDuplicates (Postgres: updateOnDuplicate/ignore)
    const roles = await db.Role.bulkCreate(rolesData, { ignoreDuplicates: true, returning: true });
    
    console.log('🌱 Seeding Program Studi...');
    const prodiData = [
      { name: 'S1 Farmasi', code: 'S1-F', head: 'Apoteker Kepala', status: 'Aktif' },
      { name: 'S1 Gizi', code: 'S1-G', head: 'Ahli Gizi Senior', status: 'Aktif' },
      { name: 'D3 Kebidanan', code: 'D3-K', head: 'Bidan Kepala', status: 'Aktif' }
    ];
    const prodis = await db.ProgramStudi.bulkCreate(prodiData, { ignoreDuplicates: true, returning: true });

    console.log('🌱 Seeding Doc Types...');
    const docTypesData = [
      { name: 'Skripsi', slug: 'skripsi', description: 'Karya Tulis Ilmiah Mahasiswa S1', is_active: true },
      { name: 'KTI (Karya Tulis Ilmiah)', slug: 'kti', description: 'Karya Tulis Ilmiah Mahasiswa D3', is_active: true },
      { name: 'Jurnal Penelitian', slug: 'jurnal-penelitian', description: 'Jurnal dari Penelitian Dosen/Mahasiswa', is_active: true }
    ];
    await db.DocType.bulkCreate(docTypesData, { ignoreDuplicates: true });

    console.log('🌱 Seeding Admin User...');
    // Cari role super-admin
    const superAdminRole = roles.find(r => r.slug === 'super-admin') || await db.Role.findOne({ where: { slug: 'super-admin' } });
    
    if (superAdminRole) {
      // Check jika admin sudah ada
      const adminExists = await db.User.findOne({ where: { email: 'admin@example.com' } });
      if (!adminExists) {
        // Create user
        await db.User.create({
          name: 'Super Admin',
          email: 'admin@example.com',
          password: 'password', // akan di hash otomatis oleh hook beforeCreate
          nip: '111111',
          role_id: superAdminRole.id,
          status: 'active'
        });
        console.log('✅ Admin user created (admin@example.com / password)');
      } else {
        console.log('ℹ️ Admin user already exists.');
      }
    }

    console.log('🌱 Seeding Permissions...');
    const permissionsData = [
      { name: 'manage_master_data', description: 'Kelola data master (prodi, doc type, role)' },
      { name: 'manage_users', description: 'Kelola data user' },
      { name: 'manage_repositories', description: 'Kelola repository (upload, edit, hapus)' }
    ];
    await db.Permission.bulkCreate(permissionsData, { ignoreDuplicates: true, returning: true });

    // Assign semua permission ke super-admin
    const saRole = await db.Role.findOne({ where: { slug: 'super-admin' } });
    if (saRole) {
      const allPermissions = await db.Permission.findAll();
      const now = new Date().toISOString();
      for (const perm of allPermissions) {
        await db.sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (:roleId, :permId, :now, :now) ON CONFLICT DO NOTHING`,
          { replacements: { roleId: saRole.id, permId: perm.id, now } }
        );
      }
      console.log('✅ All permissions assigned to Super Admin');
    }

    console.log('✅ All seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
