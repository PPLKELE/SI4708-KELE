import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock } from 'lucide-react';

const PengawasDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Dashboard Pengawas Lapangan</h1>
        <p>Selamat bertugas, {user?.nama}. Berikut adalah status pekerjaan hari ini.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '50%' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Progress Validasi (Pending)</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Bukti Kerja yang belum diunggah</p>
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>0 Tugas</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--warning)', color: 'white', borderRadius: '50%' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Jadwal Hari Ini</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Absensi & Logbook</p>
            </div>
          </div>
          <div className="stat-value">0 Lokasi</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Tugas Harian Saya</h3>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
          Belum ada jadwal penugasan dari Admin hari ini.
        </div>
      </div>
    </div>
  );
};

export default PengawasDashboard;
