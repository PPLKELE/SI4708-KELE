import React, { useState, useEffect } from 'react';
import { Camera, Check, Clock, X, Plus } from 'lucide-react';

const Logbook = () => {
  const [schedules, setSchedules] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [progres, setProgres] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [lokasiPekerjaan, setLokasiPekerjaan] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [foto, setFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchWorkers();
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

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/workers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addWorker = () => {
    if (!selectedWorkerId) return;
    if (selectedWorkers.length >= 10) return alert('Maksimal 10 pekerja.');
    if (selectedWorkers.find(w => w.id == selectedWorkerId)) return alert('Pekerja sudah ditambahkan.');
    
    const worker = workers.find(w => w.id == selectedWorkerId);
    if (worker) {
      setSelectedWorkers([...selectedWorkers, { id: worker.id, nama: worker.nama }]);
      setSelectedWorkerId('');
    }
  };

  const removeWorker = (id) => {
    setSelectedWorkers(selectedWorkers.filter(w => w.id !== id));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    if (selectedWorkers.length < 1 || selectedWorkers.length > 10) {
      return alert('Pekerja yang divalidasi harus minimal 1 dan maksimal 10 orang.');
    }
    if (!lokasiPekerjaan.trim()) {
      return alert('Lokasi pekerjaan harus diisi.');
    }
    if (!foto) {
      return alert('Bukti foto kerja harus diunggah.');
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('schedule_id', selectedSchedule.id);
      formData.append('progres_persentase', progres);
      formData.append('catatan', catatan);
      formData.append('lokasi_pekerjaan', lokasiPekerjaan);
      formData.append('pekerja_terlibat', JSON.stringify(selectedWorkers));
      formData.append('foto', foto);

      const res = await fetch('http://localhost:4000/api/logbooks', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });
      
      if (res.ok) {
        alert('Bukti kerja berhasil disimpan!');
        setSelectedSchedule(null);
        setProgres(0);
        setCatatan('');
        setLokasiPekerjaan('');
        setSelectedWorkers([]);
        setFoto(null);
        setPreviewUrl(null);
      } else {
        const errData = await res.json();
        alert('Gagal menyimpan: ' + (errData.error || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi saat menyimpan.');
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
                <label className="form-label">Lokasi Pekerjaan (Aktual)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Jalan Mawar Barat RT 02..."
                  value={lokasiPekerjaan}
                  onChange={e => setLokasiPekerjaan(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Validasi Pekerja Hadir ({selectedWorkers.length}/10)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select 
                    className="form-input" 
                    value={selectedWorkerId}
                    onChange={e => setSelectedWorkerId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Pilih Pekerja --</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>[ID: {w.id}] {w.nama}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-outline" onClick={addWorker} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}>
                    <Plus size={16} /> Tambah
                  </button>
                </div>
                
                {selectedWorkers.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {selectedWorkers.map(w => (
                      <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.4rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                        <span>{w.nama} <span style={{ opacity: 0.6 }}>(ID: {w.id})</span></span>
                        <button type="button" onClick={() => removeWorker(w.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedWorkers.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--error)', marginTop: '0.25rem' }}>Minimal harus menambahkan 1 pekerja yang hadir.</p>
                )}
              </div>

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
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', background: 'var(--background)', position: 'relative' }}>
                  {!previewUrl ? (
                    <>
                      <Camera size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Klik untuk mengambil foto atau unggah file</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mendukung format JPG, PNG</p>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: 'var(--primary)', cursor: 'pointer' }}>Ubah Foto</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFoto(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }} 
                  />
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
