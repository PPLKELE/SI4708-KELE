import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, MapPin, Users, Calendar, X, Activity, CheckCircle, Clock, Target, Briefcase, Globe } from 'lucide-react';

export default function PerencanaanProgram() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nama_program: '',
    jenis_program: '',
    deskripsi: '',
    lokasi: '',
    kordinat: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: 'planned'
  });
  
  // Stakeholder State
  const [stakeholders, setStakeholders] = useState([]);
  const [shNama, setShNama] = useState('');
  const [shPeran, setShPeran] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, []);

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
      console.error('Error fetching programs:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStakeholder = (e) => {
    e.preventDefault();
    const nama = shNama.trim();
    const peran = shPeran.trim() || 'Lainnya';
    
    if (nama) {
      setStakeholders([...stakeholders, { nama, peran }]);
      setShNama('');
      setShPeran('');
    }
  };

  const handleRemoveStakeholder = (index) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      nama_program: '',
      jenis_program: '',
      deskripsi: '',
      lokasi: '',
      kordinat: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      status: 'planned'
    });
    setStakeholders([]);
    setShNama('');
    setShPeran('');
    setEditingId(null);
    setShowModal(false);
  };

  const parseStakeholders = (str) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      // Handle legacy data where it was an array of strings
      return parsed.map(item => {
        if (typeof item === 'string') {
          return { nama: item, peran: 'Lainnya' };
        }
        return item;
      });
    } catch(e) {
      // Fallback
      if (typeof str === 'string') {
        return str.split(',').map(s => ({ nama: s.trim(), peran: 'Lainnya' }));
      }
      return [];
    }
  };

  const handleEdit = (prog) => {
    setFormData({
      nama_program: prog.nama_program,
      jenis_program: prog.jenis_program,
      deskripsi: prog.deskripsi,
      lokasi: prog.lokasi || '',
      kordinat: prog.kordinat || '',
      tanggal_mulai: prog.tanggal_mulai ? prog.tanggal_mulai.slice(0, 10) : '',
      tanggal_selesai: prog.tanggal_selesai ? prog.tanggal_selesai.slice(0, 10) : '',
      status: prog.status || 'planned'
    });
    
    setStakeholders(parseStakeholders(prog.stakeholders));
    setEditingId(prog.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus program ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/programs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPrograms();
      }
    } catch (err) {
      console.error('Error deleting program:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        stakeholders: JSON.stringify(stakeholders)
      };
      
      const url = editingId 
        ? `http://localhost:4000/api/programs/${editingId}`
        : 'http://localhost:4000/api/programs';
        
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchPrograms();
        resetForm();
      }
    } catch (err) {
      console.error('Error saving program:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12}/> Aktif</span>;
      case 'completed':
        return <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Selesai</span>;
      case 'planned':
      default:
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Direncanakan</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '800', 
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem' 
          }}>
            Perencanaan Program & Area
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Kelola program kerja, tentukan kordinat area, dan tingkatkan koordinasi multi-stakeholder.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '99px', boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)' }}
        >
          <Plus size={20} />
          <span>Tambah Program</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {programs.map(prog => (
          <div key={prog.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s ease', cursor: 'default' }} 
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ 
                    background: 'rgba(15, 118, 110, 0.1)', 
                    color: 'var(--primary)', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {prog.jenis_program}
                  </span>
                  {getStatusBadge(prog.status)}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: '1.3' }}>
                  {prog.nama_program}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background)', padding: '4px', borderRadius: '8px' }}>
                <button onClick={() => handleEdit(prog)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(prog.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={16} /></button>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem', flex: 1, lineHeight: '1.6' }}>
              {prog.deskripsi}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-main)', background: 'rgba(248, 250, 252, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>AREA / LOKASI</div>
                    <div>{prog.lokasi || '-'}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Globe size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>KORDINAT PETA</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{prog.kordinat || '-'}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>PERIODE PELAKSANAAN</div>
                  <div>{prog.tanggal_mulai ? new Date(prog.tanggal_mulai).toLocaleDateString('id-ID') : '-'} s/d {prog.tanggal_selesai ? new Date(prog.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                <Users size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem' }}>KOORDINASI STAKEHOLDER</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {parseStakeholders(prog.stakeholders).length > 0 ? (
                      parseStakeholders(prog.stakeholders).map((st, i) => (
                        <div key={i} style={{ 
                          background: 'white', 
                          border: '1px solid var(--border)',
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{st.nama}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', paddingLeft: '4px', borderLeft: '1px solid var(--border)' }}>{st.peran}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Belum ada stakeholder ditambahkan</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            <Target size={48} color="var(--border)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Belum Ada Program</h3>
            <p>Mulai perencanaan dengan menambahkan program kerja dan area fokus.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)',
          zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '750px', padding: '0', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)' }}>
            <div style={{ 
              padding: '1.5rem 2rem', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'var(--surface)',
              zIndex: 10
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase color="var(--primary)" />
                {editingId ? 'Edit Program Kerja' : 'Perencanaan Program Baru'}
              </h2>
              <button onClick={resetForm} style={{ background: 'var(--background)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '50%' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="form-label">Nama Program</label>
                  <input type="text" className="form-input" name="nama_program" value={formData.nama_program} onChange={handleInputChange} required placeholder="Contoh: Pemberdayaan Petani Sayur" style={{ width: '100%' }} />
                </div>
                <div>
                  <label className="form-label">Kategori / Jenis</label>
                  <input type="text" className="form-input" name="jenis_program" value={formData.jenis_program} onChange={handleInputChange} required placeholder="Contoh: Pertanian" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="form-label">Area / Lokasi Fokus</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <MapPin size={18} />
                    </div>
                    <input type="text" className="form-input" name="lokasi" value={formData.lokasi} onChange={handleInputChange} style={{ width: '100%', paddingLeft: '2.5rem' }} placeholder="Contoh: Dusun Mawar, Desa Karya" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Kordinat Area (Lat, Long)</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Globe size={18} />
                    </div>
                    <input type="text" className="form-input" name="kordinat" value={formData.kordinat} onChange={handleInputChange} style={{ width: '100%', paddingLeft: '2.5rem' }} placeholder="-6.914744, 107.609810" />
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 118, 110, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(15, 118, 110, 0.1)' }}>
                <label className="form-label" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Users size={18} /> Koordinasi Multi-Stakeholder
                </label>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={shNama} 
                      onChange={(e) => setShNama(e.target.value)} 
                      placeholder="Nama Institusi / Tokoh" 
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <select 
                      className="form-input" 
                      value={shPeran} 
                      onChange={(e) => setShPeran(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="">-- Pilih Peran --</option>
                      <option value="Pemerintah Desa">Pemerintah Desa</option>
                      <option value="LSM / Komunitas">LSM / Komunitas</option>
                      <option value="Swasta / Sponsor">Swasta / Sponsor</option>
                      <option value="Relawan">Relawan</option>
                      <option value="Tokoh Masyarakat">Tokoh Masyarakat</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <button type="button" onClick={handleAddStakeholder} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                    Tambah
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', minHeight: '40px' }}>
                  {stakeholders.map((st, i) => (
                    <div key={i} style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      background: 'white', border: '1px solid var(--primary)', color: 'var(--text-main)', 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem',
                      boxShadow: '0 2px 5px rgba(15, 118, 110, 0.1)'
                    }}>
                      <strong>{st.nama}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({st.peran})</span>
                      <button type="button" onClick={() => handleRemoveStakeholder(i)} style={{ background: 'var(--danger)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: '2px', borderRadius: '50%', marginLeft: '4px' }}><X size={12} /></button>
                    </div>
                  ))}
                  {stakeholders.length === 0 && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Belum ada stakeholder ditambahkan. Silakan isi form di atas.</span>}
                </div>
              </div>

              <div>
                <label className="form-label">Deskripsi Lengkap</label>
                <textarea className="form-input" name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} rows={3} placeholder="Jelaskan tujuan dan ruang lingkup program ini..." style={{ width: '100%', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="form-label">Tanggal Mulai</label>
                  <input type="date" className="form-input" name="tanggal_mulai" value={formData.tanggal_mulai} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
                <div>
                  <label className="form-label">Tanggal Selesai</label>
                  <input type="date" className="form-input" name="tanggal_selesai" value={formData.tanggal_selesai} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
                <div>
                  <label className="form-label">Status Program</label>
                  <select className="form-input" name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%' }}>
                    <option value="planned">Direncanakan</option>
                    <option value="active">Aktif Berjalan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={resetForm} className="btn btn-outline" style={{ background: 'var(--background)' }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>{editingId ? 'Simpan Perubahan' : 'Buat Program'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
