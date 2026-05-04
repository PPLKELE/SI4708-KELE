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
    const { nama_program, jenis_program, deskripsi, lokasi, kordinat, stakeholders, tanggal_mulai, tanggal_selesai } = req.body;
    // stakeholders is expected to be a JSON string or text from frontend
    db.query(`INSERT INTO micro_programs (nama_program, jenis_program, deskripsi, lokasi, kordinat, stakeholders, tanggal_mulai, tanggal_selesai) VALUES (?,?,?,?,?,?,?,?)`,
        [nama_program, jenis_program, deskripsi, lokasi, kordinat || null, stakeholders, tanggal_mulai, tanggal_selesai], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

app.put('/api/programs/:id', authenticateToken, (req, res) => {
    const { nama_program, jenis_program, deskripsi, lokasi, kordinat, stakeholders, tanggal_mulai, tanggal_selesai } = req.body;
    db.query(`UPDATE micro_programs SET nama_program=?, jenis_program=?, deskripsi=?, lokasi=?, kordinat=?, stakeholders=?, tanggal_mulai=?, tanggal_selesai=? WHERE id=?`,
        [nama_program, jenis_program, deskripsi, lokasi, kordinat || null, stakeholders, tanggal_mulai, tanggal_selesai, req.params.id], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, ...req.body });
    });
});

app.delete('/api/programs/:id', authenticateToken, (req, res) => {
    db.query(`DELETE FROM micro_programs WHERE id=?`, [req.params.id], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Program deleted successfully' });
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

// --- 9. Ekonomi & Insentif (SDG 1) ---
function parseYearMonth(req) {
    const now = new Date();
    let tahun = parseInt(req.query.tahun, 10);
    let bulan = parseInt(req.query.bulan, 10);
    if (!Number.isFinite(tahun)) tahun = now.getFullYear();
    if (!Number.isFinite(bulan)) bulan = now.getMonth() + 1;
    bulan = Math.min(12, Math.max(1, bulan));
    return { tahun, bulan };
}

// Kalkulator akumulasi upah per bulan (default: bulan berjalan)
app.get('/api/insentif/akumulasi/:worker_id', authenticateToken, (req, res) => {
    const workerId = parseInt(req.params.worker_id, 10);
    if (!Number.isFinite(workerId)) {
        return res.status(400).json({ error: 'worker_id tidak valid' });
    }
    const { tahun, bulan } = parseYearMonth(req);

    db.query('SELECT id FROM workers WHERE id = ?', [workerId], (err, w) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!w || w.length === 0) return res.status(404).json({ error: 'Pekerja tidak ditemukan' });

        const sumSql = `
            SELECT COALESCE(SUM(jumlah_upah), 0) AS total_upah, COUNT(*) AS jumlah_entri
            FROM insentif
            WHERE worker_id = ? AND YEAR(tanggal) = ? AND MONTH(tanggal) = ?
        `;
        db.query(sumSql, [workerId, tahun, bulan], (err2, sumRows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const perJenisSql = `
                SELECT jenis_insentif, COALESCE(SUM(jumlah_upah), 0) AS subtotal
                FROM insentif
                WHERE worker_id = ? AND YEAR(tanggal) = ? AND MONTH(tanggal) = ?
                GROUP BY jenis_insentif
                ORDER BY subtotal DESC
            `;
            db.query(perJenisSql, [workerId, tahun, bulan], (err3, perJenis) => {
                if (err3) return res.status(500).json({ error: err3.message });
                const row = sumRows[0] || {};
                const total = Number(row.total_upah);
                res.json({
                    worker_id: workerId,
                    periode: { tahun, bulan, label: `${String(bulan).padStart(2, '0')}/${tahun}` },
                    total_upah: total,
                    jumlah_entri: Number(row.jumlah_entri) || 0,
                    per_jenis: (perJenis || []).map((r) => ({
                        jenis_insentif: r.jenis_insentif,
                        subtotal: Number(r.subtotal)
                    }))
                });
            });
        });
    });
});

// Riwayat pendapatan / insentif pekerja
app.get('/api/insentif/riwayat/:worker_id', authenticateToken, (req, res) => {
    const workerId = parseInt(req.params.worker_id, 10);
    if (!Number.isFinite(workerId)) {
        return res.status(400).json({ error: 'worker_id tidak valid' });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    db.query('SELECT id FROM workers WHERE id = ?', [workerId], (err, w) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!w || w.length === 0) return res.status(404).json({ error: 'Pekerja tidak ditemukan' });

        const sql = `
            SELECT id, worker_id, tanggal, jumlah_upah, jenis_insentif, keterangan, created_at
            FROM insentif
            WHERE worker_id = ?
            ORDER BY tanggal DESC, id DESC
            LIMIT ?
        `;
        db.query(sql, [workerId, limit], (err2, rows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
                worker_id: workerId,
                jumlah: rows.length,
                riwayat: rows.map((r) => ({
                    id: r.id,
                    tanggal: r.tanggal,
                    jumlah_upah: Number(r.jumlah_upah),
                    jenis_insentif: r.jenis_insentif,
                    keterangan: r.keterangan,
                    created_at: r.created_at
                }))
            });
        });
    });
});

// Catat insentif / upah baru (mis. setelah validasi kerja)
app.post('/api/insentif', authenticateToken, (req, res) => {
    const { worker_id, tanggal, jumlah_upah, jenis_insentif, keterangan } = req.body;
    const wid = parseInt(worker_id, 10);
    const jumlah = Number(jumlah_upah);
    if (!Number.isFinite(wid)) {
        return res.status(400).json({ error: 'worker_id wajib dan harus angka' });
    }
    if (!jenis_insentif || typeof jenis_insentif !== 'string') {
        return res.status(400).json({ error: 'jenis_insentif wajib diisi' });
    }
    if (!Number.isFinite(jumlah) || jumlah < 0) {
        return res.status(400).json({ error: 'jumlah_upah harus angka non-negatif' });
    }
    const tgl = tanggal || new Date().toISOString().slice(0, 10);

    db.query('SELECT id FROM workers WHERE id = ?', [wid], (err, w) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!w || w.length === 0) return res.status(404).json({ error: 'Pekerja tidak ditemukan' });

        db.query(
            `INSERT INTO insentif (worker_id, tanggal, jumlah_upah, jenis_insentif, keterangan) VALUES (?,?,?,?,?)`,
            [wid, tgl, jumlah, jenis_insentif.trim(), keterangan || null],
            function (err2, result) {
                if (err2) return res.status(500).json({ error: err2.message });
                res.status(201).json({
                    ok: true,
                    data: {
                        id: result.insertId,
                        worker_id: wid,
                        tanggal: tgl,
                        jumlah_upah: jumlah,
                        jenis_insentif: jenis_insentif.trim(),
                        keterangan: keterangan || null
                    }
                });
            }
        );
    });
});

// Penghargaan pekerja
app.post('/api/rewards', authenticateToken, (req, res) => {
    const { worker_id, nama_penghargaan, tanggal_pemberian } = req.body;
    const wid = parseInt(worker_id, 10);
    if (!Number.isFinite(wid)) {
        return res.status(400).json({ error: 'worker_id wajib dan harus angka' });
    }
    if (!nama_penghargaan || typeof nama_penghargaan !== 'string') {
        return res.status(400).json({ error: 'nama_penghargaan wajib diisi' });
    }
    const tgl = tanggal_pemberian || new Date().toISOString().slice(0, 10);

    db.query('SELECT id FROM workers WHERE id = ?', [wid], (err, w) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!w || w.length === 0) return res.status(404).json({ error: 'Pekerja tidak ditemukan' });

        db.query(
            `INSERT INTO rewards (worker_id, nama_penghargaan, tanggal_pemberian) VALUES (?,?,?)`,
            [wid, nama_penghargaan.trim(), tgl],
            function (err2, result) {
                if (err2) return res.status(500).json({ error: err2.message });
                res.status(201).json({
                    ok: true,
                    data: {
                        id: result.insertId,
                        worker_id: wid,
                        nama_penghargaan: nama_penghargaan.trim(),
                        tanggal_pemberian: tgl
                    }
                });
            }
        );
    });
});

app.get('/api/rewards/riwayat/:worker_id', authenticateToken, (req, res) => {
    const workerId = parseInt(req.params.worker_id, 10);
    if (!Number.isFinite(workerId)) {
        return res.status(400).json({ error: 'worker_id tidak valid' });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    db.query('SELECT id FROM workers WHERE id = ?', [workerId], (err, w) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!w || w.length === 0) return res.status(404).json({ error: 'Pekerja tidak ditemukan' });

        db.query(
            `SELECT id, worker_id, nama_penghargaan, tanggal_pemberian, created_at
             FROM rewards WHERE worker_id = ? ORDER BY tanggal_pemberian DESC, id DESC LIMIT ?`,
            [workerId, limit],
            (err2, rows) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ worker_id: workerId, jumlah: rows.length, riwayat: rows });
            }
        );
    });
});

// --- 10. Dashboard Analisis ---
app.get('/api/dashboard/analisis', authenticateToken, (req, res) => {
    const queryTotalWarga = 'SELECT COUNT(id) as total FROM workers';
    const queryTotalInsentif = 'SELECT COALESCE(SUM(jumlah_upah), 0) as total FROM insentif';
    const queryTren = `
        SELECT DATE_FORMAT(tanggal, '%Y-%m') as bulan, COUNT(DISTINCT worker_id) as partisipasi 
        FROM insentif 
        GROUP BY DATE_FORMAT(tanggal, '%Y-%m') 
        ORDER BY bulan ASC LIMIT 6
    `;
    const querySebaran = `
        SELECT jenis_program as name, COUNT(*) as value 
        FROM micro_programs 
        GROUP BY jenis_program
    `;
    const queryCapaian = `
        SELECT id, nama_program, jenis_program, status, tanggal_mulai, tanggal_selesai 
        FROM micro_programs 
        ORDER BY created_at DESC LIMIT 10
    `;
    const queryDampak = `SELECT COALESCE(SUM(kuantitas), 0) as total FROM inventaris WHERE LOWER(kategori) LIKE '%sampah%' OR LOWER(kategori) LIKE '%kompos%' OR LOWER(kategori) LIKE '%organik%'`;

    db.query(queryTotalWarga, (err, resWarga) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(queryTotalInsentif, (err, resInsentif) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(queryTren, (err, resTren) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query(querySebaran, (err, resSebaran) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.query(queryCapaian, (err, resCapaian) => {
                        if (err) return res.status(500).json({ error: err.message });
                        db.query(queryDampak, (err, resDampak) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            const dampakLingkungan = { value: resDampak[0].total, unit: "Kg (Kompos/Sampah)" };

                            // Fill gaps for tren partisipasi for the last 6 months
                            const months = [];
                            for(let i=5; i>=0; i--) {
                                const d = new Date();
                                d.setMonth(d.getMonth() - i);
                                const m = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0');
                                months.push(m);
                            }
                            const trenFilled = months.map(m => {
                                const found = resTren.find(t => t.bulan === m);
                                return { bulan: m, partisipasi: found ? found.partisipasi : 0 };
                            });

                            res.json({
                                total_warga_bekerja: resWarga[0].total,
                                total_insentif: resInsentif[0].total,
                                dampak_lingkungan: dampakLingkungan,
                                tren_partisipasi: trenFilled,
                                sebaran_program: resSebaran.map(s => ({ name: s.name || 'Lainnya', value: s.value })),
                                rincian_capaian: resCapaian
                            });
                        });
                    });
                });
            });
        });
    });
});

// --- 11. Edukasi API ---
app.get('/api/edukasi', authenticateToken, (req, res) => {
    db.query(`SELECT * FROM edukasi_contents ORDER BY created_at DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/edukasi', authenticateToken, (req, res) => {
    const { judul, deskripsi, kategori, tipe_konten, url_konten } = req.body;
    db.query(`INSERT INTO edukasi_contents (judul, deskripsi, kategori, tipe_konten, url_konten) VALUES (?,?,?,?,?)`,
        [judul, deskripsi, kategori, tipe_konten, url_konten], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// --- 12. Inventaris API ---
app.get('/api/inventaris', authenticateToken, (req, res) => {
    db.query(`SELECT * FROM inventaris ORDER BY created_at DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventaris', authenticateToken, (req, res) => {
    const { nama_barang, kategori, kuantitas, satuan } = req.body;
    db.query(`INSERT INTO inventaris (nama_barang, kategori, kuantitas, satuan) VALUES (?,?,?,?)`,
        [nama_barang, kategori, kuantitas || 0, satuan], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

app.put('/api/inventaris/:id', authenticateToken, (req, res) => {
    const { kuantitas } = req.body;
    db.query(`UPDATE inventaris SET kuantitas=? WHERE id=?`,
        [kuantitas, req.params.id], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, kuantitas });
    });
});

app.post('/api/inventaris/history', authenticateToken, (req, res) => {
    const { inventaris_id, jumlah_perubahan, tipe_perubahan, keterangan } = req.body;
    db.query(`INSERT INTO inventaris_history (inventaris_id, jumlah_perubahan, tipe_perubahan, keterangan) VALUES (?,?,?,?)`,
        [inventaris_id, jumlah_perubahan, tipe_perubahan, keterangan], function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// --- 13. Produktivitas API ---
app.get('/api/produktivitas/tren', authenticateToken, (req, res) => {
    // Menghitung logbook yang mencapai progres 100% sebagai "pekerjaan selesai"
    const query = `
        SELECT DATE_FORMAT(created_at, '%Y-%m') as periode, COUNT(id) as jumlah_selesai
        FROM logbooks
        WHERE progres_persentase >= 100
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY periode ASC
        LIMIT 12
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 14. Dashboard Admin Main ---
app.get('/api/dashboard/main', authenticateToken, (req, res) => {
    const data = {
        profiling: { total: 0, petani: 0, pembersih: 0, pengrajin: 0 },
        tugas: { total: 0, aktif: 0, terjadwal: 0, selesai: 0 },
        dampak: [],
        area: []
    };

    const qProfiling = 'SELECT kemampuan_utama, COUNT(*) as count FROM workers GROUP BY kemampuan_utama';
    const qTugas = 'SELECT status, COUNT(*) as count FROM work_schedules GROUP BY status';
    const qSelesai = 'SELECT COUNT(DISTINCT schedule_id) as count FROM logbooks WHERE progres_persentase >= 100';
    const qDampak = 'SELECT nama_barang, kuantitas, satuan, kategori FROM inventaris ORDER BY kuantitas DESC LIMIT 3';
    const qArea = 'SELECT id, nama_program as nama, lokasi, kordinat, status FROM micro_programs ORDER BY created_at DESC';

    db.query(qProfiling, (err, rProf) => {
        if (rProf) {
            rProf.forEach(r => {
                const k = (r.kemampuan_utama || '').toLowerCase();
                data.profiling.total += r.count;
                if (k.includes('tani') || k.includes('kebun') || k.includes('tanam')) data.profiling.petani += r.count;
                else if (k.includes('bersih') || k.includes('sampah') || k.includes('sapu')) data.profiling.pembersih += r.count;
                else if (k.includes('rajin') || k.includes('kriya') || k.includes('anyam')) data.profiling.pengrajin += r.count;
            });
        }
        
        db.query(qTugas, (err, rTugas) => {
            if (rTugas) {
                rTugas.forEach(r => {
                    data.tugas.total += r.count;
                    if (r.status === 'active' || r.status === 'in_progress') data.tugas.aktif += r.count;
                    else if (r.status === 'scheduled') data.tugas.terjadwal += r.count;
                });
            }
            
            db.query(qSelesai, (err, rSelesai) => {
                if (rSelesai && rSelesai.length > 0) {
                    data.tugas.selesai = rSelesai[0].count;
                }
                
                db.query(qDampak, (err, rDampak) => {
                    if (rDampak) data.dampak = rDampak;
                    
                    db.query(qArea, (err, rArea) => {
                        if (rArea) data.area = rArea;
                        res.json(data);
                    });
                });
            });
        });
    });
});

// --- 15. Search API ---
app.get('/api/search', authenticateToken, (req, res) => {
    const q = req.query.q || '';
    if (!q) return res.json([]);
    
    const likeQ = `%${q}%`;
    const results = [];
    
    // Search Workers
    db.query('SELECT id, nama, kemampuan_utama FROM workers WHERE nama LIKE ? OR kemampuan_utama LIKE ? LIMIT 5', [likeQ, likeQ], (err, wRes) => {
        if (wRes) wRes.forEach(w => results.push({ type: 'Pekerja', title: w.nama, desc: w.kemampuan_utama, link: '/admin/profiling' }));
        
        // Search Programs
        db.query('SELECT id, nama_program, jenis_program FROM micro_programs WHERE nama_program LIKE ? OR jenis_program LIKE ? LIMIT 5', [likeQ, likeQ], (err, pRes) => {
            if (pRes) pRes.forEach(p => results.push({ type: 'Program', title: p.nama_program, desc: p.jenis_program, link: '/admin/program' }));
            
            // Note: We can also add hardcoded route navigation suggestions in the frontend
            res.json(results);
        });
    });
});

// --- 16. Notifications API ---
app.get('/api/notifications', authenticateToken, (req, res) => {
    db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/notifications', authenticateToken, (req, res) => {
    const { user_id, judul, pesan, link_url } = req.body;
    db.query('INSERT INTO notifications (user_id, judul, pesan, link_url) VALUES (?, ?, ?, ?)', [user_id, judul, pesan, link_url || null], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// --- 17. Messages API ---
app.get('/api/messages', authenticateToken, (req, res) => {
    db.query(`
        SELECT m.*, s.nama as sender_name, r.nama as receiver_name 
        FROM messages m 
        JOIN users s ON m.sender_id = s.id 
        JOIN users r ON m.receiver_id = r.id 
        WHERE m.sender_id = ? OR m.receiver_id = ? 
        ORDER BY m.created_at DESC LIMIT 50
    `, [req.user.id, req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/messages', authenticateToken, (req, res) => {
    const { receiver_id, pesan } = req.body;
    db.query('INSERT INTO messages (sender_id, receiver_id, pesan) VALUES (?, ?, ?)', [req.user.id, receiver_id, pesan], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        // Also create a notification for the receiver
        const notifTitle = `Pesan baru dari ${req.user.nama}`;
        db.query('INSERT INTO notifications (user_id, judul, pesan) VALUES (?, ?, ?)', [receiver_id, notifTitle, pesan.substring(0, 50)]);
        res.json({ id: result.insertId, sender_id: req.user.id, receiver_id, pesan });
    });
});

app.get('/api/pengawas/monitoring', authenticateToken, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const pengawasId = req.user.id;

    const data = {
        stats: {
            todaySchedules: 0,
            pendingLogbooks: 0,
            reportedProblems: 0
        },
        schedules: []
    };

    // 1. Get today's schedules with logbook info
    const querySchedules = `
        SELECT ws.id, ws.tanggal, ws.jam_mulai, ws.jam_selesai, ws.status as schedule_status, 
               mp.nama_program, mp.lokasi,
               l.id as logbook_id, l.progres_persentase
        FROM work_schedules ws
        JOIN micro_programs mp ON ws.program_id = mp.id
        LEFT JOIN logbooks l ON ws.id = l.schedule_id
        WHERE ws.tanggal = ?
        ORDER BY ws.jam_mulai ASC
    `;

    // 2. Get reported problems today by this pengawas
    const queryProblems = `
        SELECT COUNT(*) as count 
        FROM field_problems 
        WHERE pengawas_id = ? AND tanggal = ?
    `;

    db.query(querySchedules, [today], (err, schedRows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        data.schedules = schedRows || [];
        data.stats.todaySchedules = data.schedules.length;
        
        // Count pending logbooks (schedules without logbook entry)
        data.stats.pendingLogbooks = data.schedules.filter(s => !s.logbook_id).length;

        db.query(queryProblems, [pengawasId, today], (err, probRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            data.stats.reportedProblems = probRows[0]?.count || 0;
            res.json(data);
        });
    });
});

app.get('/api/users/list', authenticateToken, (req, res) => {
    db.query('SELECT id, nama, role FROM users WHERE id != ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/* Simple Test API */
app.get('/ping', (req, res) => res.json({ message: "pong" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Work4Village Server is running on port ${PORT}`);
});
