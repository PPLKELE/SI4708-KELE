import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { TrendingUp, Activity, CheckCircle, Calendar } from 'lucide-react';

const Produktivitas = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTren();
  }, []);

  const fetchTren = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/produktivitas/tren', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Gagal mengambil data tren produktivitas');
      const result = await res.json();
      
      const finalData = result.map(item => {
        const [y, m] = item.periode.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1);
        const monthName = date.toLocaleString('id-ID', { month: 'short' });
        
        return {
          name: `${monthName} ${y}`,
          PekerjaanRencana: item.rencana,
          PekerjaanBerjalan: item.berjalan,
          PekerjaanSelesai: item.selesai
        };
      });
      
      setData(finalData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSelesai = data.reduce((sum, item) => sum + item.PekerjaanSelesai, 0);
  const avgSelesai = data.length > 0 ? (totalSelesai / data.length).toFixed(1) : 0;
  
  // Hitung persentase kenaikan/penurunan (bulan terakhir dibanding bulan sebelumnya)
  let trendPercentage = 0;
  let isPositiveTrend = true;
  if (data.length >= 2) {
    const lastMonth = data[data.length - 1].PekerjaanSelesai;
    const prevMonth = data[data.length - 2].PekerjaanSelesai;
    if (prevMonth > 0) {
      trendPercentage = ((lastMonth - prevMonth) / prevMonth) * 100;
      isPositiveTrend = trendPercentage >= 0;
    }
  }

  if (loading) return <div className="p-8 text-center" style={{ padding: '2rem' }}>Memuat data...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Analisis Tren Produktivitas Warga
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Visualisasi data perbandingan jumlah pekerjaan yang selesai antar periode guna mengevaluasi efektivitas program kerja.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Pekerjaan Selesai</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalSelesai}</h3>
            </div>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px', color: 'var(--primary)' }}>
              <CheckCircle size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Dari {data.length} periode tercatat
          </div>
        </div>

        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rata-rata Penyelesaian</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{avgSelesai}</h3>
            </div>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '8px', color: '#4f46e5' }}>
              <Activity size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Pekerjaan per bulan
          </div>
        </div>

        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tren Bulan Terakhir</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPositiveTrend ? '#16a34a' : '#dc2626' }}>
                {isPositiveTrend ? '+' : ''}{trendPercentage.toFixed(1)}%
              </h3>
            </div>
            <div style={{ background: isPositiveTrend ? '#dcfce7' : '#fee2e2', padding: '0.75rem', borderRadius: '8px', color: isPositiveTrend ? '#16a34a' : '#dc2626' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Dibanding bulan sebelumnya
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Calendar size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
              Grafik Tren Pekerjaan Selesai (Garis)
            </h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fill: '#6b7280'}} tickLine={false} axisLine={{stroke: '#e5e7eb'}} />
                <YAxis domain={[0, dataMax => (dataMax < 5 ? 5 : Math.ceil(dataMax * 1.2))]} tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="PekerjaanRencana" 
                  name="Jumlah Pekerjaan Rencana" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="PekerjaanBerjalan" 
                  name="Jumlah Pekerjaan Berjalan" 
                  stroke="#fbbf24" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="PekerjaanSelesai" 
                  name="Jumlah Pekerjaan Selesai" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Activity size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
              Perbandingan Antar Periode (Batang)
            </h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fill: '#6b7280'}} tickLine={false} axisLine={{stroke: '#e5e7eb'}} />
                <YAxis domain={[0, dataMax => (dataMax < 5 ? 5 : Math.ceil(dataMax * 1.2))]} tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar 
                  dataKey="PekerjaanRencana" 
                  name="Jumlah Pekerjaan Rencana" 
                  fill="#cbd5e1" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="PekerjaanBerjalan" 
                  name="Jumlah Pekerjaan Berjalan" 
                  fill="#fbbf24" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="PekerjaanSelesai" 
                  name="Jumlah Pekerjaan Selesai" 
                  fill="var(--secondary)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Produktivitas;
