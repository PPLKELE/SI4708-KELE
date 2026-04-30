const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Create DB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '' // Adjust if you have a password
});

// Connect, create DB, and switch to it
db.connect(err => {
    if (err) {
        console.error('DB Connection Error:', err);
        return;
    }

    db.query('CREATE DATABASE IF NOT EXISTS work4village_db', (err) => {
        if (err) throw err;
        console.log('Database work4village_db checked/created.');

        // Switch to the database
        db.query('USE work4village_db', (useErr) => {
            if (useErr) throw useErr;
            console.log('Connected to MySQL work4village_db.');
            initDb();
        });
    });
});

function initDb() {
    // Array of queries
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'pengawas') NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS households (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kepala_keluarga VARCHAR(255) NOT NULL,
            alamat TEXT NOT NULL,
            rt_rw VARCHAR(50) NOT NULL,
            jumlah_anggota INT NOT NULL,
            pendapatan_per_bulan INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS workers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama VARCHAR(255) NOT NULL,
            tanggal_lahir DATE,
            jenis_kelamin VARCHAR(10),
            alamat TEXT,
            no_telepon VARCHAR(50),
            status_keluarga VARCHAR(50),
            kemampuan_utama VARCHAR(255),
            household_id INT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS micro_programs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_program VARCHAR(255) NOT NULL,
            jenis_program VARCHAR(100) NOT NULL,
            deskripsi TEXT,
            lokasi VARCHAR(255),
            stakeholders TEXT,
            tanggal_mulai DATE,
            tanggal_selesai DATE,
            status VARCHAR(50) DEFAULT 'planned',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS work_schedules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            program_id INT,
            tanggal DATE,
            jam_mulai VARCHAR(50),
            jam_selesai VARCHAR(50),
            shift_label VARCHAR(100),
            status VARCHAR(50) DEFAULT 'scheduled',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (program_id) REFERENCES micro_programs(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS schedule_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT,
            schedule_id INT,
            FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
            FOREIGN KEY (schedule_id) REFERENCES work_schedules(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS logbooks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            schedule_id INT,
            pengawas_id INT,
            progres_persentase INT DEFAULT 0,
            catatan TEXT,
            foto_bukti_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (schedule_id) REFERENCES work_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY (pengawas_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS insentif (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT NOT NULL,
            tanggal DATE NOT NULL,
            jumlah_upah DECIMAL(12,2) NOT NULL DEFAULT 0,
            jenis_insentif VARCHAR(100) NOT NULL,
            keterangan TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS rewards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT NOT NULL,
            nama_penghargaan VARCHAR(255) NOT NULL,
            tanggal_pemberian DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS edukasi_contents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            judul VARCHAR(255) NOT NULL,
            deskripsi TEXT NOT NULL,
            kategori VARCHAR(100) NOT NULL,
            tipe_konten VARCHAR(50) NOT NULL,
            url_konten TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS inventaris (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_barang VARCHAR(255) NOT NULL,
            kategori VARCHAR(100) NOT NULL,
            kuantitas DECIMAL(10,2) DEFAULT 0,
            satuan VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS inventaris_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inventaris_id INT NOT NULL,
            jumlah_perubahan DECIMAL(10,2) NOT NULL,
            tipe_perubahan ENUM('tambah', 'kurang') NOT NULL,
            keterangan TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inventaris_id) REFERENCES inventaris(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS field_problems (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pengawas_id INT NOT NULL,
            tanggal DATE NOT NULL,
            waktu TIME NOT NULL,
            masalah TEXT NOT NULL,
            tingkatan_masalah ENUM('low', 'mediate', 'high') NOT NULL,
            lokasi_masalah VARCHAR(255) NOT NULL,
            kordinat VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pengawas_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    ];

    // Execute table creations sequentially to avoid foreign key issues
    let currentQuery = 0;
    const runQuery = () => {
        if (currentQuery >= tables.length) {
            // Safely alter existing micro_programs table to add new columns (ignore error if column already exists)
            db.query("ALTER TABLE micro_programs ADD COLUMN lokasi VARCHAR(255)", () => {
                db.query("ALTER TABLE micro_programs ADD COLUMN stakeholders TEXT", () => {
                    seedDefaults();
                });
            });
            return;
        }
        db.query(tables[currentQuery], (err) => {
            if (err) console.error('Table creation error:', err);
            currentQuery++;
            runQuery();
        });
    };
    runQuery();
}

function seedDefaults() {
    // Insert default admin
    db.query("SELECT id FROM users WHERE email = ?", ['admin@village.com'], (err, results) => {
        if (!results || results.length === 0) {
            const adminPassword = bcrypt.hashSync('admin123', 8);
            db.query("INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Administrator', 'admin@village.com', adminPassword, 'admin']);
        }
    });

    // Insert default pengawas
    db.query("SELECT id FROM users WHERE email = ?", ['pengawas@village.com'], (err, results) => {
        if (!results || results.length === 0) {
            const pengawasPassword = bcrypt.hashSync('pengawas123', 8);
            db.query("INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Pengawas Lapangan', 'pengawas@village.com', pengawasPassword, 'pengawas']);
        }
    });

    // Insert default edukasi contents
    db.query("SELECT COUNT(*) as count FROM edukasi_contents", (err, results) => {
        if (results && results[0].count === 0) {
            const defaultContents = [
                ['Cara Menanam Sayur Organik', 'Panduan dasar menanam sayuran organik di pekarangan rumah untuk kebutuhan sehari-hari.', 'Pertanian', 'Artikel', 'modal:menanam-sayur'],
                ['Mengelola Sampah Organik Menjadi Kompos', 'Langkah-langkah mudah mengubah sisa makanan dan sampah organik menjadi pupuk kompos yang berguna.', 'Lingkungan', 'Video', 'https://www.youtube.com/watch?v=eBjriH59MLg'],
                ['Membuat Kerajinan dari Barang Bekas', 'Ide kreatif mendaur ulang barang bekas menjadi kerajinan bernilai jual.', 'Keterampilan', 'Artikel', 'modal:kerajinan'],
                ['Tips & Trik: Membuat Kompos Kualitas Tinggi', 'Panduan singkat dan praktis dalam membuat kompos dari limbah rumah tangga dengan rasio karbon nitrogen yang pas.', 'Lingkungan', 'Artikel', 'modal:tips-kompos'],
                ['Tips & Trik: Menghemat Air Pertanian', 'Strategi cerdas mengelola penggunaan air untuk perkebunan dengan mulsa dan irigasi tetes.', 'Pertanian', 'Artikel', 'modal:tips-air'],
                ['Tips & Trik: Keselamatan Kerja Lapangan', 'Modul panduan menjaga kesehatan dan keselamatan, pencegahan dehidrasi saat bekerja di lapangan.', 'Kesehatan', 'Artikel', 'modal:tips-kesehatan'],
                ['Video: Cara Membuat Kompos Cair', 'Tutorial video langkah demi langkah membuat pupuk organik cair dari sampah dapur tangga rumah.', 'Lingkungan', 'Video', 'https://www.youtube.com/watch?v=F0OqNq8F4Xo'],
                ['Video: Panduan Membuat Kompos Padat Bokashi', 'Metode efektif menggunakan EM4 untuk mempercepat pembuatan kompos bokashi siap pakai.', 'Lingkungan', 'Video', 'https://www.youtube.com/watch?v=R9K2S8B72f0'],
                ['Video: Pembuatan Pupuk Kompos Daun Kering', 'Memanfaatkan limbah daun kering untuk pembuatan pupuk kompos dengan cara sederhana.', 'Pertanian', 'Video', 'https://www.youtube.com/watch?v=v2R8p6QzBqg']
            ];
            const sql = "INSERT INTO edukasi_contents (judul, deskripsi, kategori, tipe_konten, url_konten) VALUES ?";
            db.query(sql, [defaultContents], (insertErr) => {
                if (insertErr) console.error('Error seeding edukasi contents:', insertErr);
                else console.log('Default edukasi contents seeded.');
            });
        }
    });

    // Insert default inventaris
    db.query("SELECT COUNT(*) as count FROM inventaris", (err, results) => {
        if (results && results[0].count === 0) {
            const defaultInventaris = [
                ['Pupuk Kompos Organik', 'Kompos', 50, 'Kg'],
                ['Sayur Bayam', 'Sayur', 120, 'Ikat'],
                ['Tas Rajut Plastik', 'Kerajinan', 15, 'Unit']
            ];
            const sql = "INSERT INTO inventaris (nama_barang, kategori, kuantitas, satuan) VALUES ?";
            db.query(sql, [defaultInventaris], (insertErr) => {
                if (insertErr) console.error('Error seeding inventaris:', insertErr);
                else console.log('Default inventaris seeded.');
            });
        }
    });
}

module.exports = db;
