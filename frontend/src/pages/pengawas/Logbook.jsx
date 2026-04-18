import React, { useState, useEffect } from 'react';
import { Camera, Check, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Logbook = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = schedule => useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [progres, setProgres] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        schedule_id: selectedSchedule.id,
        progres_persentase: progres,
        catatan: catatan,
        foto_bukti_url: 'https://placeholder.com/uploaded-evidence.jpg' // Simulated URL
      };

      const res = await fetch('http://localhost:4000/api/logbooks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Bukti kerja berhasil disimpan!');
        setSelectedSchedule(null);
        setProgres(0);
        setCatatan('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Logbook & Validasi Kerja</h1>
        <p>Unggah bukti pekerjaan untuk mencatat kehadiran dan penyelesaian tugas harian.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        {/* Kolom Kiri: Daftar Jadwal */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Jadwal Penugasan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p>Memuat jadwal...</p>
            ) : schedules.length === 0 ? (
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Tidak ada jadwal aktif saat ini.
              </div>
            ) : schedules.map(s => (
              <div 
                key={s.id} 
                className={`glass-panel ${selectedSchedule?.id === s.id ? 'active' : ''}`}
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer',
                  border: selectedSchedule?.id === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedSchedule?.id === s.id ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface)'
                }}
                onClick={() => setSelectedSchedule(s)}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.nama_program || `Program #${s.program_id}`}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {s.jam_mulai} - {s.jam_selesai}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Form Upload Bukti */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          {!selectedSchedule ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ margin: '0 auto 1rem', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={32} opacity={0.5} />
              </div>
              <h3>Pilih Jadwal dari Kiri</h3>
              <p>Pilih salah satu jadwal tugas untuk mengunggah bukti dan persentase kehadiran.</p>
            </div>
          ) : (
            <form onSubmit={handleUpload}>
              <h3 style={{ marginBottom: '0.5rem' }}>Upload Bukti Kerja</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Program: {selectedSchedule.nama_program || `Task #${selectedSchedule.program_id}`} ({selectedSchedule.tanggal})
              </p>

              <div className="form-group">
                <label className="form-label">Progres Penyelesaian (%)</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={progres} 
                  onChange={e => setProgres(e.target.value)} 
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)', marginTop: '0.5rem' }}>
                  {progres}% Selesai
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Kegiatan (Opsional)</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Ceritakan kendala atau progres hari ini..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unggah Foto Bukti Kerja (Evidence)</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', background: 'var(--background)' }}>
                  <Camera size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Klik untuk mengambil foto atau unggah file</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mendukung format JPG, PNG</p>
                  <input type="file" style={{ display: 'none' }} id="fileUpload" />
                  <label htmlFor="fileUpload" className="btn btn-outline" style={{ marginTop: '1rem', cursor: 'pointer' }}>Pilih File</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <Check size={18} /> {isSubmitting ? 'Menyimpan...' : 'Kirim Bukti Validasi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logbook;
