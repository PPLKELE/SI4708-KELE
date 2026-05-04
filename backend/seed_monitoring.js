const db = require('./database');

const seedMonitoringData = async () => {
    console.log("Memulai seeding data monitoring...");
    const today = new Date().toISOString().split('T')[0];
    const waktuSekarang = new Date().toTimeString().slice(0, 5);

    // 1. Get Pengawas ID
    db.query("SELECT id FROM users WHERE email = 'pengawas@village.com'", (err, results) => {
        if (err || results.length === 0) {
            console.error("Pengawas tidak ditemukan. Pastikan sudah ada user pengawas@village.com");
            process.exit(1);
        }
        const pengawasId = results[0].id;

        // 2. Insert Micro Programs
        const programs = [
            ['Pembersihan Saluran Air Desa', 'Infrastruktur', 'Pembersihan got utama', 'Desa Sukamaju RT 01', 'active'],
            ['Pembuatan Kompos Organik', 'Lingkungan', 'Pengolahan sampah', 'Bank Sampah RW 03', 'active'],
            ['Perbaikan Jalan Setapak', 'Infrastruktur', 'Pengecoran jalan', 'Jalan Mawar RT 02', 'active']
        ];
        
        db.query("INSERT INTO micro_programs (nama_program, jenis_program, deskripsi, lokasi, status) VALUES ?", [programs], (err, progResult) => {
            if (err) throw err;
            const prog1Id = progResult.insertId;
            const prog2Id = prog1Id + 1;
            const prog3Id = prog1Id + 2;

            // 3. Insert Work Schedules (All for TODAY)
            const schedules = [
                [prog1Id, today, '08:00', '12:00', 'Pagi', 'in_progress'],
                [prog2Id, today, '13:00', '16:00', 'Siang', 'scheduled'],
                [prog3Id, today, '09:00', '15:00', 'Penuh', 'scheduled']
            ];

            db.query("INSERT INTO work_schedules (program_id, tanggal, jam_mulai, jam_selesai, shift_label, status) VALUES ?", [schedules], (err, schedResult) => {
                if (err) throw err;
                const sched1Id = schedResult.insertId;
                const sched2Id = sched1Id + 1;
                // sched3Id = sched1Id + 2 (No logbook for this one, to simulate "pending")

                // 4. Insert Logbooks (Progress updates)
                const logbooks = [
                    [sched1Id, pengawasId, 100, 'Pembersihan selesai 100%'], // Selesai
                    [sched2Id, pengawasId, 50, 'Sedang memilah sampah organik'] // Dalam proses
                ];

                db.query("INSERT INTO logbooks (schedule_id, pengawas_id, progres_persentase, catatan) VALUES ?", [logbooks], (err) => {
                    if (err) throw err;

                    // 5. Insert Field Problems
                    const problems = [
                        [pengawasId, today, waktuSekarang, 'Ada tumpukan sampah yang menyumbat keras di got utama', 'high', 'Desa Sukamaju RT 01'],
                        [pengawasId, today, waktuSekarang, 'Kurang alat untuk memilah sampah basah', 'mediate', 'Bank Sampah RW 03']
                    ];

                    db.query("INSERT INTO field_problems (pengawas_id, tanggal, waktu, masalah, tingkatan_masalah, lokasi_masalah) VALUES ?", [problems], (err) => {
                        if (err) throw err;
                        console.log("Seeding data monitoring selesai! Silakan refresh dashboard.");
                        process.exit(0);
                    });
                });
            });
        });
    });
};

setTimeout(seedMonitoringData, 1000); // Tunggu sebentar agar koneksi DB siap
