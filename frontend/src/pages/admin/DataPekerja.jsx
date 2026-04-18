import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Search } from 'lucide-react';

const DataPekerja = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    no_telepon: '',
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
        setFormData({ nama: '', tanggal_lahir: '', jenis_kelamin: 'L', alamat: '', no_telepon: '', kemampuan_utama: '', household_id: ''});
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in">
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
              <label className="form-label">No Telepon</label>
              <input type="text" className="form-input" value={formData.no_telepon} onChange={e => setFormData({...formData, no_telepon: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Kemampuan Utama / Keahlian</label>
              <input type="text" className="form-input" placeholder="contoh: Berkebun, Mengolah Sampah" required value={formData.kemampuan_utama} onChange={e => setFormData({...formData, kemampuan_utama: e.target.value})} />
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data pekerja.</td></tr>
            ) : workers.map(w => (
              <tr key={w.id}>
                <td># {w.id}</td>
                <td style={{ fontWeight: 500 }}>{w.nama}</td>
                <td><span className="badge badge-success">{w.kemampuan_utama || 'Umum'}</span></td>
                <td>{w.kepala_keluarga || '-'}</td>
                <td>Aktif</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPekerja;
