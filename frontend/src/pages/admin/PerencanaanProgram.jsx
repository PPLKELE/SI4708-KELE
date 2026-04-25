import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, MapPin, Users, Calendar, X } from 'lucide-react';

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
    tanggal_mulai: '',
    tanggal_selesai: ''
  });
  
  // Stakeholder State (Array of strings)
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholderInput, setStakeholderInput] = useState('');

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
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = stakeholderInput.trim();
      if (val && !stakeholders.includes(val)) {
        setStakeholders([...stakeholders, val]);
        setStakeholderInput('');
      }
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
      tanggal_mulai: '',
      tanggal_selesai: ''
    });
    setStakeholders([]);
    setStakeholderInput('');
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (prog) => {
    setFormData({
      nama_program: prog.nama_program,
      jenis_program: prog.jenis_program,
      deskripsi: prog.deskripsi,
      lokasi: prog.lokasi || '',
      tanggal_mulai: prog.tanggal_mulai ? prog.tanggal_mulai.slice(0, 10) : '',
      tanggal_selesai: prog.tanggal_selesai ? prog.tanggal_selesai.slice(0, 10) : ''
    });
    
    // Parse stakeholders if it's a JSON string
    let parsedStakeholders = [];
    if (prog.stakeholders) {
      try {
        parsedStakeholders = JSON.parse(prog.stakeholders);
      } catch (e) {
        // Fallback to split if it's somehow comma separated
        parsedStakeholders = prog.stakeholders.split(',').map(s => s.trim());
      }
    }
    setStakeholders(parsedStakeholders);
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

  const parseStakeholders = (str) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch(e) {
      return [str];
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Perencanaan Program & Area</h1>
          <p style={{ color: 'var(--text-muted)' }}>Kelola program kerja, tentukan area, dan koordinasi dengan stakeholder.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          <span>Tambah Program</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {programs.map(prog => (
          <div key={prog.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ 
                  background: 'rgba(10, 132, 255, 0.1)', 
                  color: 'var(--primary)', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: '600' 
                }}>
                  {prog.jenis_program}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  {prog.nama_program}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(prog)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(prog.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
              {prog.deskripsi}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span><strong>Area:</strong> {prog.lokasi || 'Belum ditentukan'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--primary)" />
                <span><strong>Periode:</strong> {prog.tanggal_mulai ? new Date(prog.tanggal_mulai).toLocaleDateString('id-ID') : '-'} s/d {prog.tanggal_selesai ? new Date(prog.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Users size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {parseStakeholders(prog.stakeholders).length > 0 ? (
                    parseStakeholders(prog.stakeholders).map((st, i) => (
                      <span key={i} style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{st}</span>
                    ))
                  ) : (
                    <span>Belum ada stakeholder</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Belum ada program yang direncanakan.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{editingId ? 'Edit Program' : 'Perencanaan Program Baru'}</h2>
              <button onClick={resetForm} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Nama Program</label>
                  <input type="text" className="form-input" name="nama_program" value={formData.nama_program} onChange={handleInputChange} required placeholder="Contoh: Pemberdayaan Petani Sayur" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Kategori / Jenis</label>
                  <input type="text" className="form-input" name="jenis_program" value={formData.jenis_program} onChange={handleInputChange} required placeholder="Contoh: Pertanian" />
                </div>
              </div>
              
              <div>
                <label className="form-label">Area / Lokasi Fokus</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MapPin size={18} />
                  </div>
                  <input type="text" className="form-input" name="lokasi" value={formData.lokasi} onChange={handleInputChange} style={{ paddingLeft: '2.5rem' }} placeholder="Contoh: Dusun Mawar, Desa Karya" />
                </div>
              </div>

              <div>
                <label className="form-label">Koordinasi Stakeholder</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={stakeholderInput} 
                    onChange={(e) => setStakeholderInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' ? handleAddStakeholder(e) : null}
                    placeholder="Ketik nama institusi/tokoh, lalu tekan Enter" 
                  />
                  <button type="button" onClick={handleAddStakeholder} className="btn" style={{ background: 'var(--bg-secondary)' }}>Tambah</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {stakeholders.map((st, i) => (
                    <div key={i} style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.25rem', 
                      background: 'rgba(10, 132, 255, 0.1)', color: 'var(--primary)', 
                      padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem' 
                    }}>
                      {st}
                      <button type="button" onClick={() => handleRemoveStakeholder(i)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                    </div>
                  ))}
                  {stakeholders.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Belum ada stakeholder ditambahkan</span>}
                </div>
              </div>

              <div>
                <label className="form-label">Deskripsi Lengkap</label>
                <textarea className="form-input" name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} rows={3} placeholder="Jelaskan tujuan dan ruang lingkup program ini..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Tanggal Mulai</label>
                  <input type="date" className="form-input" name="tanggal_mulai" value={formData.tanggal_mulai} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Tanggal Selesai</label>
                  <input type="date" className="form-input" name="tanggal_selesai" value={formData.tanggal_selesai} onChange={handleInputChange} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={resetForm} className="btn" style={{ background: 'var(--bg-secondary)' }}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Simpan Perubahan' : 'Buat Program'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
