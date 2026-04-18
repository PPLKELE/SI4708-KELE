import React, { useState, useEffect } from 'react';
import { Users, UserSquare, Calendar, TrendingUp, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_workers: 0, total_programs: 0, total_households: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Dashboard Overview</h1>
          <p>Selamat datang, {user?.nama}. Berikut adalah ringkasan sistem hari ini.</p>
        </div>
        <button className="btn btn-primary">
          <Calendar size={18} /> Buat Program Baru
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Total Pekerja Warga</div>
              <div className="stat-value">{loading ? '...' : stats.total_workers}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>+12% bulan ini</span>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Keluarga Prasejahtera</div>
              <div className="stat-value">{loading ? '...' : stats.total_households}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: 'var(--radius-sm)' }}>
              <UserSquare size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total terdata dalam sistem
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Program Aktif</div>
              <div className="stat-value">{loading ? '...' : stats.total_programs}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
              <LayoutDashboard size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>Monitoring Berjalan</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Program Terbaru</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Program</th>
              <th>Jenis Program</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada data program kerja.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
