const db = require('../models');

const seedRepositories = async () => {
  try {
    // 1. Sinkronisasi DB (opsional)
    await db.sequelize.sync({ alter: true });

    console.log('🌱 Starting Dedicated Repository Seeder...');

    // Dapatkan IDs untuk program studi dan tipe dokumen
    const docTypes = await db.DocType.findAll();
    const prodisList = await db.ProgramStudi.findAll();
    const adminUser = await db.User.findOne({ where: { email: 'admin@example.com' } });

    if (!adminUser || docTypes.length === 0 || prodisList.length === 0) {
      console.warn('⚠️ Tidak dapat melakukan seed Repositories. Pastikan Admin, DocType, dan Prodi sudah di-seed terlebih dahulu (jalankan seed.js dasar).');
      process.exit(1);
    } 

    const draftRepositoriesData = [
      {
        title: 'Analisis Formulasi Sirup Paracetamol dengan Ekstrak Daun Jambu Biji',
        author: 'Budi Santoso',
        abstract: 'Penelitian ini bertujuan untuk menganalisis stabilitas sirup paracetamol yang dikombinasikan dengan ekstrak daun jambu biji...',
        year: 2023,
        file_name: 'budi_santoso_skripsi_2023.pdf',
        file_path: '/uploads/dummy1.pdf',
        file_size: 1048576, // 1MB
        status: 'published',
        prodi_id: prodisList.find(p => p.code === 'S1-F')?.id || prodisList[0].id,
        doc_type_id: docTypes.find(d => d.slug === 'skripsi')?.id || docTypes[0].id,
        uploaded_by: adminUser.id,
      },
      {
        title: 'Evaluasi Penggunaan Obat Hipertensi di Puskesmas Melati',
        author: 'Siti Aminah',
        abstract: 'Evaluasi dilakukan untuk melihat pola peresepan obat antihipertensi...',
        year: 2022,
        file_name: 'siti_aminah_kti_2022.pdf',
        file_path: '/uploads/dummy2.pdf',
        file_size: 2048576,
        status: 'published',
        prodi_id: prodisList.find(p => p.code === 'D3-K')?.id || prodisList[0].id,
        doc_type_id: docTypes.find(d => d.slug === 'kti')?.id || docTypes[0].id,
        uploaded_by: adminUser.id,
      },
      {
        title: 'Efektivitas Konseling Gizi terhadap Kepatuhan Diet Pasien Diabetes Mellitus',
        author: 'Andi Wijaya',
        abstract: 'Penelitian intervensional untuk menilai kepatuhan diet pasien...',
        year: 2024,
        file_name: 'andi_wijaya_penelitian_2024.pdf',
        file_path: '/uploads/dummy3.pdf',
        file_size: 1548576,
        status: 'published',
        prodi_id: prodisList.find(p => p.code === 'S1-G')?.id || prodisList[0].id,
        doc_type_id: docTypes.find(d => d.slug === 'jurnal-penelitian')?.id || docTypes[0].id,
        uploaded_by: adminUser.id,
      },
    ];

    // Generate 12 more generic variants to reach 15 total
    for(let i=4; i<=15; i++) {
      draftRepositoriesData.push({
        title: `Penelitian Ilmiah Lanjutan Seri ${i}: Analisis Data Komprehensif`,
        author: `Penulis Mahasiswa ${i}`,
        abstract: `Ini adalah abstrak buatan untuk penelitian seri ke-${i}. Fokus utama adalah pada metodologi dan analisis.`,
        year: 2020 + (i % 5),
        file_name: `penelitian_seri_${i}.pdf`,
        file_path: `/uploads/dummy${i}.pdf`,
        file_size: 1000000 + (i * 100000),
        status: i % 4 === 0 ? 'draft' : 'published', // Beberapa sengaja di set draft (menunggu persetujuan)
        prodi_id: prodisList[i % prodisList.length].id,
        doc_type_id: docTypes[i % docTypes.length].id,
        uploaded_by: adminUser.id,
      });
    }

    let seededRepos = [];
    
    // We can clear existing repos if we want to ensure a clean slate, but let's just append or check.
    // However, since it's a dedicated script, maybe we drop existing dummy data to avoid duplicates:
    await db.DownloadLog.destroy({ where: {} });
    await db.Repository.destroy({ where: {} });
    console.log('🗑️  Cleared old Repositories and Logs for clean seeding...');

    seededRepos = await db.Repository.bulkCreate(draftRepositoriesData, { returning: true });
    console.log(`✅ Seeded ${seededRepos.length} Repositories`);

    // --- FAKE DOWNLOAD LOGS SEEDING ---
    console.log('🌱 Seeding Download Logs...');
    const logsData = [];
    // Buat 20 dummy download logs acak
    for (let i = 0; i < 20; i++) {
      const randomRepo = seededRepos[Math.floor(Math.random() * seededRepos.length)];
      
      // Generate date within last 30 days
      const downloadDate = new Date();
      downloadDate.setDate(downloadDate.getDate() - Math.floor(Math.random() * 30));
      
      logsData.push({
        repository_id: randomRepo.id,
        user_id: adminUser.id,
        downloaded_at: downloadDate,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
      });
    }
    
    await db.DownloadLog.bulkCreate(logsData);
    console.log(`✅ Seeded ${logsData.length} Download Logs`);

    console.log('🎉 Dedicated Repository Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during dedicated repository seeding:', error);
    process.exit(1);
  }
};

seedRepositories();
