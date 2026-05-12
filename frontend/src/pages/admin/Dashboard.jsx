import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Trash2, Hammer, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [data, setData] = useState({
    profiling: { total: 0, petani: 0, pembersih: 0, pengrajin: 0 },
    tugas: { total: 0, aktif: 0, terjadwal: 0, selesai: 0 },
    dampak: [],
    area: []
  });
  const [loading, setLoading] = useState(true);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [mapType, setMapType] = useState('street');

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!isAddingMode) return;
        const { lat, lng } = e.latlng;
        const kordinat = `${lat},${lng}`;
        
        const nama = prompt("Masukkan Nama Program/Area Baru:");
        if (!nama) {
          setIsAddingMode(false);
          return;
        }
        
        const lokasi = prompt("Masukkan Deskripsi Lokasi (contoh: RT 01):") || "Area Baru";
        
        // Save to backend
        fetch('http://localhost:4000/api/programs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({
            nama_program: nama,
            jenis_program: 'Lainnya',
            lokasi: lokasi,
            kordinat: kordinat,
            status: 'planned'
          })
        })
        .then(res => res.json())
        .then(newProg => {
          setData(prev => ({
            ...prev,
            area: [{ id: newProg.id, nama: nama, lokasi: lokasi, kordinat: kordinat, status: 'planned' }, ...prev.area]
          }));
          setIsAddingMode(false);
        })
        .catch(err => {
          console.error(err);
          setIsAddingMode(false);
          alert('Gagal menambahkan titik.');
        });
      }
    });
    return null;
  };

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard/main', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(resData => {
      setData(resData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const stats = {
    total_profiling: data.profiling.total,
    petani: data.profiling.petani,
    pembersih: data.profiling.pembersih,
    pengrajin: data.profiling.pengrajin,
    tugas_mingguan: data.tugas.total,
    aktif: data.tugas.aktif,
    terjadwal: data.tugas.terjadwal,
    selesai: data.tugas.selesai
  };

  const totalTugasForProgress = stats.tugas_mingguan === 0 ? 1 : stats.tugas_mingguan;

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
                <div className="progress-fill" style={{ width: `${(stats.aktif / totalTugasForProgress) * 100}%`, background: 'var(--success)' }}></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-label-row">
                <span>Terjadwal</span>
                <span className="progress-val-text">{stats.terjadwal}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(stats.terjadwal / totalTugasForProgress) * 100}%`, background: 'var(--secondary)' }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label-row">
                <span>Selesai</span>
                <span className="progress-val-text">{stats.selesai}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(stats.selesai / totalTugasForProgress) * 100}%`, background: 'var(--text-muted)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hasil Produksi & Dampak */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Hasil Produksi & Dampak</h3>
          
          <div className="impact-list">
            {data.dampak.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>Belum ada data produksi.</p>
            ) : data.dampak.map((d, i) => (
              <div className="impact-item" key={i}>
                <div className="impact-icon" style={{ 
                  background: i % 3 === 0 ? 'rgba(34, 197, 94, 0.1)' : i % 3 === 1 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
                  color: i % 3 === 0 ? 'var(--success)' : i % 3 === 1 ? 'var(--warning)' : 'var(--purple)' 
                }}>
                  {i % 3 === 0 ? <Sprout size={20} /> : i % 3 === 1 ? <Trash2 size={20} /> : <Hammer size={20} />}
                </div>
                <div className="impact-content">
                  <div className="impact-title">{d.nama_barang}</div>
                  <div className="impact-value">{d.kuantitas} {d.satuan}</div>
                </div>
                <div className="impact-desc">{d.kategori}</div>
              </div>
            ))}
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
              <button 
                className="btn btn-outline" 
                onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {mapType === 'street' ? 'Satellite' : 'Street'}
              </button>
              <button 
                className={isAddingMode ? "btn" : "btn btn-primary"} 
                onClick={() => setIsAddingMode(!isAddingMode)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: isAddingMode ? '#dc2626' : undefined, color: isAddingMode ? 'white' : undefined }}
              >
                {isAddingMode ? 'Batal Tambah' : '+ Tambah Titik'}
              </button>
            </div>
          </div>
          
          <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: isAddingMode ? '3px dashed var(--primary)' : '1px solid var(--border)', cursor: isAddingMode ? 'crosshair' : 'default' }}>
            <MapContainer center={[-6.914744, 107.609810]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              {mapType === 'street' ? (
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              ) : (
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              )}
              <MapEvents />
              {data.area.filter(a => a.kordinat).map((a, i) => {
                const [lat, lng] = a.kordinat.split(',').map(Number);
                if (isNaN(lat) || isNaN(lng)) return null;
                return (
                  <Marker key={i} position={[lat, lng]}>
                    <Popup>
                      <strong>{a.nama}</strong><br/>
                      Lokasi: {a.lokasi}<br/>
                      Status: {a.status}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          {isAddingMode && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', textAlign: 'center' }}>Klik di mana saja pada peta untuk menambahkan titik lokasi area kerja baru.</div>}
        </div>

        {/* Progres Kebersihan Area */}
        <div className="glass-panel stat-card" style={{ padding: '2rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Progres Kebersihan Area</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.area.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>Belum ada data program area.</p>
            ) : data.area.map((a, i) => {
              const isDone = a.status === 'completed' || a.status === 'selesai';
              const isInProgress = a.status === 'active' || a.status === 'in_progress';
              return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: i < data.area.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{a.lokasi || a.nama}</span>
                {isDone ? (
                  <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>SELESAI</span>
                ) : isInProgress ? (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>DALAM PROSES</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--background)', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>BELUM MULAI</span>
                )}
              </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
