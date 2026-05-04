import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Search, User, Briefcase, Calendar, MapPin, X } from 'lucide-react';

const DataPekerja = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    no_telepon: '',
    kontak_darurat: '',
    status_keluarga: 'Kepala Keluarga',
    status_rumah: 'Milik Sendiri',
    riwayat_penyakit: '',
    kemampuan_utama: '',
    household_id: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [workersRes, householdsRes] = await Promise.all([
        fetch('http://localhost:4000/api/workers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:4000/api/households', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const wData = await workersRes.json();
      const hData = await householdsRes.json();
      setWorkers(wData);
      setHouseholds(hData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewProfile = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/workers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedWorker(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/workers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchData();
        setFormData({ 
          nama: '', tanggal_lahir: '', jenis_kelamin: 'L', alamat: '', 
          no_telepon: '', kontak_darurat: '', status_keluarga: 'Kepala Keluarga', 
          status_rumah: 'Milik Sendiri', riwayat_penyakit: '', kemampuan_utama: '', household_id: ''
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Manajemen Data Pekerja</h1>
          <p>Daftar warga prasejahtera yang berpartisipasi dalam program desa.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> Tambah Pekerja
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Pendaftaran Pekerja Baru</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" className="form-input" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Keluarga (Optional)</label>
              <select className="form-input" value={formData.household_id} onChange={e => setFormData({...formData, household_id: e.target.value})}>
                <option value="">- Tanpa Kepala Keluarga -</option>
                {households.map(h => (
                  <option key={h.id} value={h.id}>{h.kepala_keluarga} ({h.rt_rw})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Lahir</label>
              <input type="date" className="form-input" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Jenis Kelamin</label>
              <select className="form-input" value={formData.jenis_kelamin} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">No. HP / WhatsApp</label>
              <input type="text" className="form-input" placeholder="08xxx (Kosongkan jika tidak ada)" value={formData.no_telepon} onChange={e => setFormData({...formData, no_telepon: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Kontak Darurat / Tetangga</label>
              <input type="text" className="form-input" placeholder="Nama & No. HP (Misal: Pak RT - 08xxx)" value={formData.kontak_darurat} onChange={e => setFormData({...formData, kontak_darurat: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Kemampuan Utama / Keahlian</label>
              <input type="text" className="form-input" placeholder="contoh: Berkebun, Mengolah Sampah" required value={formData.kemampuan_utama} onChange={e => setFormData({...formData, kemampuan_utama: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Status Keluarga</label>
              <select className="form-input" value={formData.status_keluarga} onChange={e => setFormData({...formData, status_keluarga: e.target.value})}>
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Anggota Keluarga">Anggota Keluarga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status Kepemilikan Rumah</label>
              <select className="form-input" value={formData.status_rumah} onChange={e => setFormData({...formData, status_rumah: e.target.value})}>
                <option value="Milik Sendiri">Milik Sendiri</option>
                <option value="Kontrak">Kontrak / Sewa</option>
                <option value="Tidak Ada">Tidak Ada (Gelandangan/Numpang)</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Riwayat Penyakit (Jika ada)</label>
              <textarea className="form-input" rows="2" placeholder="Sebutkan riwayat penyakit atau kondisi medis..." value={formData.riwayat_penyakit} onChange={e => setFormData({...formData, riwayat_penyakit: e.target.value})}></textarea>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Alamat Lengkap</label>
              <textarea className="form-input" rows="2" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})}></textarea>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Data</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Keahlian</th>
              <th>Keluarga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data pekerja.</td></tr>
            ) : workers.map(w => (
              <tr key={w.id}>
                <td># {w.id}</td>
                <td style={{ fontWeight: 500 }}>{w.nama}</td>
                <td><span className="badge badge-success">{w.kemampuan_utama || 'Umum'}</span></td>
                <td>{w.kepala_keluarga || '-'}</td>
                <td>Aktif</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => handleViewProfile(w.id)}>Profil Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profile Detail Modal/Overlay */}
      {selectedWorker && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedWorker(null)}>
              <X size={24} />
            </button>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ width: '120px', height: '120px', background: 'var(--background-alt)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <User size={60} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedWorker.nama}</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary"><Briefcase size={14} style={{ marginRight: '4px' }} /> {selectedWorker.kemampuan_utama}</span>
                  <span className="badge badge-outline"><Calendar size={14} style={{ marginRight: '4px' }} /> {selectedWorker.tanggal_lahir ? new Date(selectedWorker.tanggal_lahir).toLocaleDateString('id-ID') : 'N/A'}</span>
                  <span className="badge badge-outline"><MapPin size={14} style={{ marginRight: '4px' }} /> {selectedWorker.alamat || 'Alamat tidak tersedia'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Informasi Keluarga & Rumah</h4>
                <p><strong>Kepala Keluarga:</strong> {selectedWorker.kepala_keluarga || '-'}</p>
                <p><strong>Status Keluarga:</strong> {selectedWorker.status_keluarga || '-'}</p>
                <p><strong>No. HP:</strong> {selectedWorker.no_telepon || 'Tidak ada'}</p>
                <p><strong>Kontak Alternatif:</strong> {selectedWorker.kontak_darurat || '-'}</p>
                <p><strong>Status Rumah:</strong> {selectedWorker.status_rumah || '-'}</p>
                <p><strong>Riwayat Sakit:</strong> {selectedWorker.riwayat_penyakit || 'Tidak ada'}</p>
                <p><strong>Alamat Keluarga:</strong> {selectedWorker.household_address || '-'}</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Program & Jadwal</h4>
                {selectedWorker.schedules && selectedWorker.schedules.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedWorker.schedules.map((s, i) => (
                      <li key={i} style={{ marginBottom: '1rem', padding: '0.5rem', background: 'var(--background-alt)', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{s.nama_program}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(s.tanggal).toLocaleDateString('id-ID')} | {s.jam_mulai} - {s.jam_selesai}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Belum ada program aktif.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPekerja;
