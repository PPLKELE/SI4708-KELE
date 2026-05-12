import React, { useState, useEffect } from 'react';
import { PlusCircle, Home, Users, MapPin, DollarSign, Search } from 'lucide-react';

const DataKeluarga = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    kepala_keluarga: '',
    alamat: '',
    rt_rw: '',
    jumlah_anggota: '',
    pendapatan_per_bulan: ''
  });

  const fetchHouseholds = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/households', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHouseholds(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/households', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchHouseholds();
        setFormData({ kepala_keluarga: '', alamat: '', rt_rw: '', jumlah_anggota: '', pendapatan_per_bulan: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredHouseholds = households.filter(h => 
    h.kepala_keluarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.rt_rw.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Data Keluarga Prasejahtera</h1>
          <p>Manajemen data rumah tangga penerima manfaat program desa.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> Tambah Keluarga
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Cari nama kepala keluarga atau RT/RW..." 
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Input Data Keluarga Baru</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Kepala Keluarga</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={formData.kepala_keluarga} 
                onChange={e => setFormData({...formData, kepala_keluarga: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">RT / RW</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Contoh: 002/005" 
                required 
                value={formData.rt_rw} 
                onChange={e => setFormData({...formData, rt_rw: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah Anggota Keluarga</label>
              <input 
                type="number" 
                className="form-input" 
                required 
                value={formData.jumlah_anggota} 
                onChange={e => setFormData({...formData, jumlah_anggota: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimasi Pendapatan / Bulan (Rp)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>Rp</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '3rem' }}
                  required 
                  value={formData.pendapatan_per_bulan} 
                  onChange={e => setFormData({...formData, pendapatan_per_bulan: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Alamat Rumah</label>
              <textarea 
                className="form-input" 
                rows="2" 
                required 
                value={formData.alamat} 
                onChange={e => setFormData({...formData, alamat: e.target.value})}
              ></textarea>
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
              <th>Kepala Keluarga</th>
              <th>RT/RW</th>
              <th>Anggota</th>
              <th>Pendapatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : filteredHouseholds.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data keluarga yang cocok.</td></tr>
            ) : filteredHouseholds.map(h => (
              <tr key={h.id}>
                <td># {h.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 500 }}>{h.kepala_keluarga}</span>
                  </div>
                </td>
                <td>{h.rt_rw}</td>
                <td><Users size={14} style={{ marginRight: '4px' }} /> {h.jumlah_anggota}</td>
                <td>Rp {h.pendapatan_per_bulan.toLocaleString('id-ID')}</td>
                <td>
                  <button className="btn btn-outline btn-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataKeluarga;
