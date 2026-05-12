import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, MapPin, Search, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PelaporanMasalah = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().slice(0, 10),
        waktu: new Date().toTimeString().slice(0, 5),
        masalah: '',
        tingkatan_masalah: 'low',
        lokasi_masalah: '',
        kordinat: ''
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/field-problems', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/field-problems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowAddForm(false);
                setFormData({
                    tanggal: new Date().toISOString().slice(0, 10),
                    waktu: new Date().toTimeString().slice(0, 5),
                    masalah: '',
                    tingkatan_masalah: 'low',
                    lokasi_masalah: '',
                    kordinat: ''
                });
                fetchReports();
            } else {
                alert('Gagal mengirim laporan. Pastikan semua field wajib diisi.');
            }
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    };

    const getSeverityColor = (level) => {
        if (level === 'high') return '#ef4444'; // Red
        if (level === 'mediate') return '#f59e0b'; // Yellow/Orange
        return '#10b981'; // Green
    };

    const filteredReports = reports.filter(r =>
        r.masalah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lokasi_masalah.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Pelaporan Masalah Lapangan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Catat dan kelola laporan masalah yang terjadi di area kerja.</p>
                </div>
                {/* Only Pengawas should typically report, but we let Admin too for flexibility unless strictly restricted */}
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                    <Plus size={18} />
                    <span>Lapor Masalah</span>
                </button>
            </div>

            {/* Modal Tambah Laporan */}
            {showAddForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: '600', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                            <AlertTriangle size={24} />
                            Formulir Pelaporan Masalah
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tanggal Kejadian</label>
                                    <input type="date" className="search-input" style={{ width: '100%' }} value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Waktu Kejadian</label>
                                    <input type="time" className="search-input" style={{ width: '100%' }} value={formData.waktu} onChange={e => setFormData({ ...formData, waktu: e.target.value })} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Deskripsi Masalah</label>
                                <textarea className="search-input" style={{ width: '100%', minHeight: '100px', resize: 'vertical' }} value={formData.masalah} onChange={e => setFormData({ ...formData, masalah: e.target.value })} required placeholder="Ceritakan detail masalah yang terjadi..." />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tingkatan Masalah</label>
                                <select className="search-input" style={{ width: '100%' }} value={formData.tingkatan_masalah} onChange={e => setFormData({ ...formData, tingkatan_masalah: e.target.value })}>
                                    <option value="low">Rendah (Low) - Masalah ringan, tidak mengganggu secara signifikan</option>
                                    <option value="mediate">Sedang (Mediate) - Cukup mengganggu, butuh penanganan</option>
                                    <option value="high">Tinggi (High) - Kritis, menghentikan progres kerja atau berbahaya</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={16} /> Lokasi Kejadian
                                </label>
                                <input type="text" className="search-input" style={{ width: '100%' }} value={formData.lokasi_masalah} onChange={e => setFormData({ ...formData, lokasi_masalah: e.target.value })} required placeholder="Cth: Lahan RT 03 / Area Tanam" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Koordinat Geografis (Opsional)</label>
                                <input type="text" className="search-input" style={{ width: '100%' }} value={formData.kordinat} onChange={e => setFormData({ ...formData, kordinat: e.target.value })} placeholder="Cth: -6.2146, 106.8451" />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>Kirim Laporan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="search-container" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                <Search className="search-icon" size={18} />
                <input type="text" className="search-input" placeholder="Cari masalah atau lokasi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e1e4e8', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e1e4e8', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Masalah</th>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Waktu & Lokasi</th>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tingkatan</th>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pelapor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map(report => (
                            <tr key={report.id} style={{ borderBottom: '1px solid #f1f2f4' }}>
                                <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '8px', color: getSeverityColor(report.tingkatan_masalah), flexShrink: 0 }}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <span style={{ fontWeight: '500', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                            {report.masalah}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                        {new Date(report.tanggal).toLocaleDateString('id-ID')} {report.waktu}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                        <MapPin size={14} /> {report.lokasi_masalah}
                                        {report.kordinat && (
                                            <a href={`https://maps.google.com/?q=${report.kordinat}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginLeft: '0.5rem' }} title="Lihat di Peta">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        padding: '0.25rem 0.75rem', 
                                        background: `${getSeverityColor(report.tingkatan_masalah)}15`, 
                                        borderRadius: '99px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '600',
                                        color: getSeverityColor(report.tingkatan_masalah), 
                                        border: `1px solid ${getSeverityColor(report.tingkatan_masalah)}40`,
                                        textTransform: 'uppercase'
                                    }}>
                                        {report.tingkatan_masalah}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                            {report.nama_pengawas?.charAt(0) || '?'}
                                        </div>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{report.nama_pengawas || 'Unknown'}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredReports.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    <AlertTriangle size={48} style={{ color: '#d9d9d9', margin: '0 auto 1rem' }} />
                                    Belum ada laporan masalah
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PelaporanMasalah;
