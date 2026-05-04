import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Briefcase, Info, Tag, Search } from 'lucide-react';

const ProgramKerja = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nama_program: '',
    jenis_program: 'Kesehatan',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: ''
  });

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/programs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/programs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchPrograms();
        setFormData({ nama_program: '', jenis_program: 'Kesehatan', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPrograms = programs.filter(p => 
    p.nama_program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jenis_program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planned': return <span className="badge badge-outline">Direncanakan</span>;
      case 'ongoing': return <span className="badge badge-primary">Berjalan</span>;
      case 'completed': return <span className="badge badge-success">Selesai</span>;
      default: return <span className="badge badge-outline">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Daftar Program Kerja Desa</h1>
          <p>Perencanaan dan pemantauan program kerja mikro untuk warga.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> Tambah Program
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Cari nama program atau jenis program..." 
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Buat Program Kerja Baru</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Program</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Contoh: Pembersihan Saluran Air RT 02" 
                required 
                value={formData.nama_program} 
                onChange={e => setFormData({...formData, nama_program: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jenis Program</label>
              <select 
                className="form-input" 
                required 
                value={formData.jenis_program} 
                onChange={e => setFormData({...formData, jenis_program: e.target.value})}
              >
                <option value="Kesehatan">Kesehatan</option>
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Lingkungan">Lingkungan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Sosial">Sosial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Mulai</label>
              <input 
                type="date" 
                className="form-input" 
                required 
                value={formData.tanggal_mulai} 
                onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Selesai</label>
              <input 
                type="date" 
                className="form-input" 
                required 
                value={formData.tanggal_selesai} 
                onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Deskripsi Program</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Jelaskan tujuan dan detail pekerjaan..." 
                required 
                value={formData.deskripsi} 
                onChange={e => setFormData({...formData, deskripsi: e.target.value})}
              ></textarea>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Program</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Program</th>
              <th>Jenis</th>
              <th>Periode</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : filteredPrograms.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada program kerja.</td></tr>
            ) : filteredPrograms.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 500 }}>{p.nama_program}</span>
                  </div>
                </td>
                <td><Tag size={14} style={{ marginRight: '4px' }} /> {p.jenis_program}</td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td>{getStatusBadge(p.status)}</td>
                <td>
                  <button className="btn btn-outline btn-sm">Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramKerja;
