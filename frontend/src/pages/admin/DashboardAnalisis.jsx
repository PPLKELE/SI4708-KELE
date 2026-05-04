import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, Users, Leaf, DollarSign } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardAnalisis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('bulanan');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // In a real app we might pass period to the API, but for MVP we use the same endpoint
      const response = await fetch('http://localhost:4000/api/dashboard/analisis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return <div style={{ padding: '2rem' }}>Memuat data analitik...</div>;
  }

  return (
    <div className="dashboard-analisis" style={{ padding: '2rem' }}>
      {/* Header and Controls */}
      <div className="flex-between" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>Laporan Dampak Program</h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>Pusat kendali evaluasi pencapaian desa.</p>
        </div>
        
        <div className="action-buttons no-print" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Filter size={18} />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent' }}
            >
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>
          
          <button 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Download size={18} />
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Headline Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '12px', color: '#0284c7' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Warga Prasejahtera Bekerja</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {data.total_warga_bekerja} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Orang</span>
            </p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '12px', color: '#16a34a' }}>
            <Leaf size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Akumulasi Dampak Lingkungan</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {data.dampak_lingkungan.value.toLocaleString('id-ID')} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>{data.dampak_lingkungan.unit}</span>
            </p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '12px', color: '#d97706' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Total Dana Insentif</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Rp {parseInt(data.total_insentif).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Tren Partisipasi Warga (Per Bulan)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.tren_partisipasi} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bulan" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="partisipasi" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jumlah Pekerja" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Sebaran Dampak Program</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                  {data.sebaran_program && data.sebaran_program.length > 0 ? (
                    <Pie
                      data={data.sebaran_program}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.sebaran_program.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  ) : (
                    <Pie
                      data={[{ name: 'Belum Ada Program', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#e2e8f0"
                      dataKey="value"
                    />
                  )}
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Rincian Capaian */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Rincian Capaian Program Kerja</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Nama Program</th>
                <th style={{ padding: '1rem' }}>Jenis Sektor</th>
                <th style={{ padding: '1rem' }}>Mulai</th>
                <th style={{ padding: '1rem' }}>Selesai</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rincian_capaian && data.rincian_capaian.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{item.nama_program}</td>
                  <td style={{ padding: '1rem' }}>{item.jenis_program}</td>
                  <td style={{ padding: '1rem' }}>{item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</td>
                  <td style={{ padding: '1rem' }}>{item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '99px', 
                      fontSize: '0.875rem',
                      background: item.status === 'selesai' || item.status === 'completed' ? '#dcfce7' : '#f1f5f9',
                      color: item.status === 'selesai' || item.status === 'completed' ? '#16a34a' : '#64748b'
                    }}>
                      {item.status || 'Berjalan'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data.rincian_capaian || data.rincian_capaian.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada data program kerja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .dashboard-analisis, .dashboard-analisis * {
            visibility: visible;
          }
          .dashboard-analisis {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .chart-container {
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
}
