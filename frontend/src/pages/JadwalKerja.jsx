import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const JadwalKerja = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/jadwal');
        if (!response.ok) {
          throw new Error('Gagal mengambil data jadwal');
        }
        const data = await response.json();
        setJadwal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={28} className="text-primary" style={{ color: 'var(--primary)' }} />
          Operasional & Penjadwalan
        </h1>
        <p>Daftar tugas dan jadwal kerja operasional.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ marginBottom: '1rem', padding: '0.85rem 1.25rem', borderLeft: '4px solid var(--danger)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Daftar Jadwal</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hari</th>
                <th>Tugas</th>
                <th>Jam Mulai</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Memuat data...
                  </td>
                </tr>
              ) : jadwal.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada jadwal.
                  </td>
                </tr>
              ) : (
                jadwal.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td style={{ fontWeight: 500 }}>{item.hari}</td>
                    <td>{item.tugas}</td>
                    <td>{item.jam_mulai}</td>
                    <td>
                      <span className={
                        `badge ${item.status === 'Selesai' ? 'badge-success'
                          : item.status === 'Berjalan' ? 'badge-primary'
                            : 'badge-warning'}`
                      }>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JadwalKerja;
