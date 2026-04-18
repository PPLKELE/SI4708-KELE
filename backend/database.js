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
        )`
    ];

    // Execute table creations sequentially to avoid foreign key issues
    let currentQuery = 0;
    const runQuery = () => {
        if (currentQuery >= tables.length) {
            seedDefaults();
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
}

module.exports = db;
