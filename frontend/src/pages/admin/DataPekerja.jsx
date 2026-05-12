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

  // Lock body scroll when profile detail is open
  useEffect(() => {
    if (selectedWorker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedWorker]);

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
    <>
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
              <input type="text" className="form-input" required value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Keluarga (Optional)</label>
              <select className="form-input" value={formData.household_id} onChange={e => setFormData({ ...formData, household_id: e.target.value })}>
                <option value="">- Tanpa Kepala Keluarga -</option>
                {households.map(h => (
                  <option key={h.id} value={h.id}>{h.kepala_keluarga} ({h.rt_rw})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Lahir</label>
              <input type="date" className="form-input" value={formData.tanggal_lahir} onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Jenis Kelamin</label>
              <select className="form-input" value={formData.jenis_kelamin} onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value })}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">No. HP / WhatsApp</label>
              <input type="text" className="form-input" placeholder="08xxx (Kosongkan jika tidak ada)" value={formData.no_telepon} onChange={e => setFormData({ ...formData, no_telepon: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Kontak Darurat / Tetangga</label>
              <input type="text" className="form-input" placeholder="Nama & No. HP (Misal: Pak RT - 08xxx)" value={formData.kontak_darurat} onChange={e => setFormData({ ...formData, kontak_darurat: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Kemampuan Utama / Keahlian</label>
              <input type="text" className="form-input" placeholder="contoh: Berkebun, Mengolah Sampah" required value={formData.kemampuan_utama} onChange={e => setFormData({ ...formData, kemampuan_utama: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Status Keluarga</label>
              <select className="form-input" value={formData.status_keluarga} onChange={e => setFormData({ ...formData, status_keluarga: e.target.value })}>
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Anggota Keluarga">Anggota Keluarga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status Kepemilikan Rumah</label>
              <select className="form-input" value={formData.status_rumah} onChange={e => setFormData({ ...formData, status_rumah: e.target.value })}>
                <option value="Milik Sendiri">Milik Sendiri</option>
                <option value="Kontrak">Kontrak / Sewa</option>
                <option value="Tidak Ada">Tidak Ada (Gelandangan/Numpang)</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Riwayat Penyakit (Jika ada)</label>
              <textarea className="form-input" rows="2" placeholder="Sebutkan riwayat penyakit atau kondisi medis..." value={formData.riwayat_penyakit} onChange={e => setFormData({ ...formData, riwayat_penyakit: e.target.value })}></textarea>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Alamat Lengkap</label>
              <textarea className="form-input" rows="2" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })}></textarea>
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
    </div>
    
    {/* Profile Detail - Professional Fullscreen Panel */}
    {selectedWorker && (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        animation: 'fadeIn 0.2s ease-out',
        overflow: 'hidden'
      }}>
        {/* Header Bar - Consistent with Main Page */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)', 
          padding: '1rem 2.5rem',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'white', borderRadius: '10px', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <User size={24} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'white', fontWeight: '600' }}>Detail Pekerja: {selectedWorker.nama}</h2>
          </div>
          
          <button 
            style={{ 
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onClick={() => setSelectedWorker(null)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={18} /> Tutup Detail
          </button>
        </div>

        {/* Main Content Area - Centered Bento Grid */}
        <div style={{ 
          flex: 1, 
          padding: '2.5rem', 
          background: '#f8fafc',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '100%',
            maxWidth: '1200px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto auto auto',
            gap: '1.5rem'
          }}>
            
            {/* 1. Profile Highlight */}
            <div className="glass-panel" style={{ 
              gridColumn: 'span 2', 
              padding: '1.75rem 2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2rem',
              background: 'white',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <div style={{ 
                width: '80px', height: '80px', 
                background: 'rgba(15, 118, 110, 0.1)', borderRadius: '20px', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                flexShrink: 0
              }}>
                <User size={40} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Identitas Utama</div>
                <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', fontWeight: '700' }}>{selectedWorker.nama}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> {selectedWorker.kemampuan_utama}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {selectedWorker.tanggal_lahir ? new Date(selectedWorker.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                </div>
              </div>
            </div>

            {/* 2. Schedule List (Tall Card) */}
            <div className="glass-panel" style={{ 
              gridRow: 'span 3', 
              padding: '2rem', 
              background: 'white',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: '600' }}>
                <Calendar size={20} color="var(--primary)" /> Jadwal Kerja Aktif
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedWorker.schedules && selectedWorker.schedules.length > 0 ? (
                  selectedWorker.schedules.slice(0, 5).map((s, i) => (
                    <div key={i} style={{ 
                      padding: '1.25rem', 
                      background: '#f8fafc', 
                      borderRadius: '12px',
                      borderLeft: '5px solid var(--primary)',
                      transition: 'transform 0.2s'
                    }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{s.nama_program}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.jam_mulai} - {s.jam_selesai}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                    <Calendar size={48} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.95rem' }}>Belum ada jadwal penugasan.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Personal Info */}
            <div className="glass-panel" style={{ 
              padding: '1.75rem', 
              background: 'white',
              border: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <DetailItem label="Status Keluarga" value={selectedWorker.status_keluarga} />
              <DetailItem label="Status Rumah" value={selectedWorker.status_rumah} />
            </div>

            {/* 4. Health & Contact */}
            <div className="glass-panel" style={{ 
              padding: '1.75rem', 
              background: 'white',
              border: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <DetailItem label="No. Telepon" value={selectedWorker.no_telepon} />
              <DetailItem label="Riwayat Sakit" value={selectedWorker.riwayat_penyakit} />
            </div>

            {/* 5. Full Address (Wide) */}
            <div className="glass-panel" style={{ 
              gridColumn: 'span 2', 
              padding: '1.75rem 2rem', 
              background: 'white',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <div style={{ 
                width: '48px', height: '48px', 
                background: 'rgba(15, 118, 110, 0.05)', borderRadius: '12px', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                flexShrink: 0
              }}>
                <MapPin size={24} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Alamat Domisili</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{selectedWorker.alamat || 'Alamat lengkap belum tercatat di sistem.'}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Professional Footer Bar */}
        <div style={{ padding: '0.75rem 2.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', background: 'white' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Sistem Informasi Work4Village • Panel Verifikasi Data Pekerja
          </div>
        </div>
      </div>
    )}
    </>
  );
};


// Helper component for detail items
const DetailItem = ({ label, value }) => (
  <div style={{ marginBottom: '0.5rem' }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '600' }}>{value || '-'}</div>
  </div>
);

export default DataPekerja;


