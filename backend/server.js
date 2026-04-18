require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'work4village_secret_key_2026';

// Middleware for auth
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// 1. Auth Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
        if (err || !results || results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        
        const user = results[0];
        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, nama: user.nama }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } });
    });
});

// 1.5 Auth Register
app.post('/api/register', (req, res) => {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password || !role) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results && results.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar' });

        const password_hash = bcrypt.hashSync(password, 8);
        db.query('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [nama, email, password_hash, role], (insertErr, result) => {
            if (insertErr) return res.status(500).json({ error: 'Gagal mendaftarkan pengguna' });
            
            res.status(201).json({ message: 'Registrasi berhasil', id: result.insertId });
        });
    });
});

// 2. Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    db.query('SELECT COUNT(*) as workerCount FROM workers', (err, wRes) => {
        db.query('SELECT COUNT(*) as programCount FROM micro_programs', (err, pRes) => {
            db.query('SELECT COUNT(*) as householdCount FROM households', (err, hRes) => {
                res.json({
                    total_workers: wRes?.[0]?.workerCount || 0,
                    total_programs: pRes?.[0]?.programCount || 0,
                    total_households: hRes?.[0]?.householdCount || 0
                });
            });
        });
    });
});

// 3. Pekerja (Workers) API
app.get('/api/workers', authenticateToken, (req, res) => {
    db.query(`SELECT w.*, h.kepala_keluarga FROM workers w LEFT JOIN households h ON w.household_id = h.id`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/workers', authenticateToken, (req, res) => {
    const { nama, tanggal_lahir, jenis_kelamin, alamat, no_telepon, status_keluarga, kemampuan_utama, household_id } = req.body;
    db.query(`INSERT INTO workers (nama, tanggal_lahir, jenis_kelamin, alamat, no_telepon, status_keluarga, kemampuan_utama, household_id) VALUES (?,?,?,?,?,?,?,?)`,
        [nama, tanggal_lahir || null, jenis_kelamin, alamat, no_telepon, status_keluarga, kemampuan_utama, household_id || null], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// 4. Households API
app.get('/api/households', authenticateToken, (req, res) => {
    db.query(`SELECT * FROM households`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/households', authenticateToken, (req, res) => {
    const { kepala_keluarga, alamat, rt_rw, jumlah_anggota, pendapatan_per_bulan } = req.body;
    db.query(`INSERT INTO households (kepala_keluarga, alamat, rt_rw, jumlah_anggota, pendapatan_per_bulan) VALUES (?,?,?,?,?)`,
        [kepala_keluarga, alamat, rt_rw, jumlah_anggota, pendapatan_per_bulan], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// 5. Micro Programs API
app.get('/api/programs', authenticateToken, (req, res) => {
    db.query(`SELECT * FROM micro_programs`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/programs', authenticateToken, (req, res) => {
    const { nama_program, jenis_program, deskripsi, tanggal_mulai, tanggal_selesai } = req.body;
    db.query(`INSERT INTO micro_programs (nama_program, jenis_program, deskripsi, tanggal_mulai, tanggal_selesai) VALUES (?,?,?,?,?)`,
        [nama_program, jenis_program, deskripsi, tanggal_mulai, tanggal_selesai], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// 6. Work Schedules API
app.get('/api/schedules', authenticateToken, (req, res) => {
    db.query(`
        SELECT ws.*, mp.nama_program 
        FROM work_schedules ws 
        LEFT JOIN micro_programs mp ON ws.program_id = mp.id
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/schedules', authenticateToken, (req, res) => {
    const { program_id, tanggal, jam_mulai, jam_selesai, shift_label } = req.body;
    db.query(`INSERT INTO work_schedules (program_id, tanggal, jam_mulai, jam_selesai, shift_label) VALUES (?,?,?,?,?)`,
        [program_id, tanggal, jam_mulai, jam_selesai, shift_label], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// 7. Schedule Assignments API (mengassign pekerja ke jadwal)
app.post('/api/schedules/:id/assign', authenticateToken, (req, res) => {
    const { worker_id } = req.body;
    const schedule_id = req.params.id;
    db.query(`INSERT INTO schedule_assignments (worker_id, schedule_id) VALUES (?,?)`,
        [worker_id, schedule_id], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, worker_id, schedule_id });
    });
});

// 8. Logbook & Evidence API
app.post('/api/logbooks', authenticateToken, (req, res) => {
    const { schedule_id, progres_persentase, catatan, foto_bukti_url } = req.body;
    const pengawas_id = req.user.id;
    db.query(`INSERT INTO logbooks (schedule_id, pengawas_id, progres_persentase, catatan, foto_bukti_url) VALUES (?,?,?,?,?)`,
        [schedule_id, pengawas_id, progres_persentase, catatan, foto_bukti_url], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body, pengawas_id });
    });
});

/* Simple Test API */
app.get('/ping', (req, res) => res.json({ message: "pong" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Work4Village Server is running on port ${PORT}`);
});
