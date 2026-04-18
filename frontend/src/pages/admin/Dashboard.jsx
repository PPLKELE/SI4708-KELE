import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Trash2, Hammer, MapPin } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dummy values based on reference image
  const stats = {
    total_profiling: 45,
    petani: 20,
    pembersih: 15,
    pengrajin: 10,
    tugas_mingguan: 25,
    aktif: 8,
    terjadwal: 12,
    selesai: 5
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      
      {/* Banner */}
      <div className="banner">
        <div>
          <h1>Halo, Admin Desa!</h1>
          <p>Selamat datang di sistem manajemen Work4Village. Pantau progres program kerja mikro hari ini.</p>
        </div>
        <button className="btn btn-white">
          Laporan Harian
        </button>
      </div>

      {/* Grid Atas */}
      <div className="dashboard-grid">
        
        {/* Total Profiling */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Total Profiling</h3>
          <div className="donut-chart-container">
            <div className="donut-chart">
              <div className="donut-inner">
                <span className="donut-value">{stats.total_profiling}</span>
                <span className="donut-label">Profiling</span>
              </div>
            </div>
            
            <div className="donut-legend">
              <div className="legend-item">
                <div><span className="legend-color" style={{ background: 'var(--success)' }}></span> PETANI</div>
                <div className="legend-val">{stats.petani}</div>
              </div>
              <div className="legend-item">
                <div><span className="legend-color" style={{ background: 'var(--orange)' }}></span> PEMBERSIH</div>
                <div className="legend-val">{stats.pembersih}</div>
              </div>
              <div className="legend-item">
                <div><span className="legend-color" style={{ background: 'var(--purple)' }}></span> PENGRAJIN</div>
                <div className="legend-val">{stats.pengrajin}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tugas Mingguan */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Tugas Mingguan</h3>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.tugas_mingguan}</div>
          
          <div className="progress-list">
            <div className="progress-item">
              <div className="progress-label-row">
                <span>Aktif</span>
                <span className="progress-val-text">{stats.aktif}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(stats.aktif / stats.tugas_mingguan) * 100}%`, background: 'var(--success)' }}></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-label-row">
                <span>Terjadwal</span>
                <span className="progress-val-text">{stats.terjadwal}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(stats.terjadwal / stats.tugas_mingguan) * 100}%`, background: 'var(--secondary)' }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label-row">
                <span>Selesai</span>
                <span className="progress-val-text">{stats.selesai}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(stats.selesai / stats.tugas_mingguan) * 100}%`, background: 'var(--text-muted)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hasil Produksi & Dampak */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Hasil Produksi & Dampak</h3>
          
          <div className="impact-list">
            <div className="impact-item">
              <div className="impact-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                <Sprout size={20} />
              </div>
              <div className="impact-content">
                <div className="impact-title">Hasil Kebun</div>
                <div className="impact-value">125 kg</div>
              </div>
              <div className="impact-desc">Sayur & Buah</div>
            </div>

            <div className="impact-item">
              <div className="impact-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                <Trash2 size={20} />
              </div>
              <div className="impact-content">
                <div className="impact-title">Sampah Terolah</div>
                <div className="impact-value">450 kg</div>
              </div>
              <div className="impact-desc">Organik & Anorganik</div>
            </div>

            <div className="impact-item">
              <div className="impact-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--purple)' }}>
                <Hammer size={20} />
              </div>
              <div className="impact-content">
                <div className="impact-title">Kerajinan</div>
                <div className="impact-value">32 unit</div>
              </div>
              <div className="impact-desc">Anyaman & Kompos</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid Bawah */}
      <div className="dashboard-grid-2">
        
        {/* Visualisasi Area Kerja */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="stat-title" style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Visualisasi Area Kerja</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Satellite</button>
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>+ Tambah Titik</button>
            </div>
          </div>
          
          {/* Map Placeholder */}
          <div className="map-placeholder">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={32} />
              <span>Map rendering container</span>
            </div>
          </div>
        </div>

        {/* Progres Kebersihan Area */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Progres Kebersihan Area</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>RT 01</span>
              <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>BERSIH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>RT 02</span>
              <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>BERSIH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>RT 03</span>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>DALAM PROSES</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>RT 04</span>
              <span className="badge" style={{ background: 'var(--background)', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>BELUM MULAI</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
