import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, MapPin, Activity } from 'lucide-react';

const PengawasDashboard = () => {
  const { user } = useAuth();
  const [monitoringData, setMonitoringData] = useState({
    stats: { todaySchedules: 0, pendingLogbooks: 0, reportedProblems: 0 },
    schedules: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/pengawas/monitoring', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setMonitoringData(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data monitoring:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonitoringData();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Dashboard Pengawas Lapangan</h1>
        <p>Selamat bertugas, {user?.nama}. Berikut adalah status pekerjaan lapangan hari ini.</p>
      </div>

      {/* Cards Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '50%' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Progress Validasi (Pending)</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Bukti Kerja belum diunggah</p>
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {loading ? '...' : `${monitoringData.stats.pendingLogbooks} Tugas`}
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--secondary)', color: 'white', borderRadius: '50%' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Jadwal Hari Ini</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Total lokasi penugasan</p>
            </div>
          </div>
          <div className="stat-value">
            {loading ? '...' : `${monitoringData.stats.todaySchedules} Lokasi`}
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--danger)', color: 'white', borderRadius: '50%' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Kendala Lapangan</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Dilaporkan hari ini</p>
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {loading ? '...' : `${monitoringData.stats.reportedProblems} Kendala`}
          </div>
        </div>
      </div>

      {/* Daftar Pekerjaan Hari Ini */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Activity size={24} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Monitoring Pekerjaan Hari Ini</h3>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data pekerjaan...</div>
        ) : monitoringData.schedules.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
            Belum ada jadwal penugasan hari ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {monitoringData.schedules.map((schedule) => {
              const progres = schedule.progres_persentase || 0;
              return (
                <div key={schedule.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  padding: '1.25rem', 
                  background: 'var(--background)', 
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: progres === 100 ? '4px solid var(--primary)' : '4px solid var(--warning)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{schedule.nama_program}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={16} /> {schedule.jam_mulai} - {schedule.jam_selesai}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={16} /> {schedule.lokasi || 'Lokasi tidak spesifik'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${progres === 100 ? 'badge-primary' : 'badge-warning'}`}>
                        {progres === 100 ? 'Selesai' : schedule.logbook_id ? 'Dalam Proses' : 'Belum Mulai'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span>Progres Pekerjaan</span>
                      <span style={{ fontWeight: 'bold' }}>{progres}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${progres}%`, 
                        background: progres === 100 ? 'var(--primary)' : 'var(--warning)',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PengawasDashboard;
