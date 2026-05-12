import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, Search, History, ArrowDownToLine, ArrowUpToLine, ShoppingCart, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TrackingReducing = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [households, setHouseholds] = useState([]);

    const [formData, setFormData] = useState({
        nama_barang: '',
        kategori: 'Kompos',
        kuantitas: '',
        satuan: 'Kg'
    });

    const [adjustData, setAdjustData] = useState({
        jumlah: '',
        keterangan: '',
        harga: '',
        pembeli: '',
        household_id: ''
    });

    useEffect(() => {
        fetchInventaris();
        fetchHouseholds();
    }, []);

    const fetchInventaris = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/inventaris', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter only Kompos and Kerajinan for Tracking & Reducing
                setItems(data.filter(i => i.kategori === 'Kompos' || i.kategori === 'Kerajinan'));
            }
        } catch (error) {
            console.error('Error fetching inventaris:', error);
        }
    };

    const fetchHouseholds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/households', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setHouseholds(await res.json());
        } catch (error) {
            console.error('Error fetching households:', error);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/inventaris/${id}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setHistoryData(await res.json());
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/inventaris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowAddForm(false);
                setFormData({ nama_barang: '', kategori: 'Kompos', kuantitas: '', satuan: 'Kg' });
                fetchInventaris();
            }
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleAdjustStock = async (e) => {
        e.preventDefault();
        try {
            let finalKeterangan = adjustData.keterangan;
            if (activeAction.type === 'jual') {
                const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
                finalKeterangan = `🛒 Penjualan kepada: ${adjustData.pembeli || 'Umum'} | Total: ${formatter.format(adjustData.harga || 0)} | Catatan: ${adjustData.keterangan || '-'}`;
            } else if (activeAction.type === 'kurang' && adjustData.household_id) {
                const targetKeluarga = households.find(h => h.id.toString() === adjustData.household_id);
                if (targetKeluarga) {
                    finalKeterangan = `🤝 Distribusi gratis kepada: Keluarga ${targetKeluarga.kepala_keluarga} (RT/RW ${targetKeluarga.rt_rw}) | Catatan: ${adjustData.keterangan || '-'}`;
                }
            }

            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/inventaris/${activeAction.id}/adjust`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    jumlah: adjustData.jumlah,
                    tipe: activeAction.type === 'jual' ? 'kurang' : activeAction.type,
                    keterangan: finalKeterangan
                })
            });
            if (res.ok) {
                setActiveAction(null);
                setAdjustData({ jumlah: '', keterangan: '', harga: '', pembeli: '', household_id: '' });
                fetchInventaris();
            }
        } catch (error) {
            console.error('Error adjusting stock:', error);
        }
    };

    const getStockColorClass = (kategori) => {
        if (kategori === 'Kompos') return '#10b981';
        if (kategori === 'Kerajinan') return '#f59e0b';
        return '#6b7280';
    };

    const filteredItems = items.filter(i =>
        i.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Leaf className="text-primary" /> Tracking & Reducing
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Fitur CRUD transaksional stok inventaris barang fisik (Kuantitas Kompos & Unit Kerajinan).</p>
                </div>
                {user && user.role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                        <Plus size={18} />
                        <span>Tambah Barang Fisik</span>
                    </button>
                )}
            </div>

            {/* Modal Tambah Barang */}
            {showAddForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: '600', fontSize: '1.25rem' }}>Tambah Barang Fisik (Hasil Olahan)</h3>
                        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nama Barang</label>
                                <input type="text" className="search-input" style={{ width: '100%' }} value={formData.nama_barang} onChange={e => setFormData({ ...formData, nama_barang: e.target.value })} required placeholder="Cth: Kompos Organik Premium" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Kategori</label>
                                    <select className="search-input" style={{ width: '100%' }} value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value, satuan: e.target.value === 'Kompos' ? 'Kg' : 'Unit' })}>
                                        <option value="Kompos">Kompos</option>
                                        <option value="Kerajinan">Kerajinan</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Satuan</label>
                                    <select className="search-input" style={{ width: '100%' }} value={formData.satuan} onChange={e => setFormData({ ...formData, satuan: e.target.value })}>
                                        <option value="Kg">Kilogram (Kg)</option>
                                        <option value="Unit">Unit (Pcs)</option>
                                        <option value="Karung">Karung / Sak</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Stok Awal</label>
                                <input type="number" step="0.1" className="search-input" style={{ width: '100%' }} value={formData.kuantitas} onChange={e => setFormData({ ...formData, kuantitas: e.target.value })} placeholder="0" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan Barang</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Kurangi/Tambah/Jual Stok */}
            {activeAction && (activeAction.type === 'tambah' || activeAction.type === 'kurang' || activeAction.type === 'jual') && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: activeAction.type === 'tambah' ? '#10b981' : (activeAction.type === 'jual' ? '#f59e0b' : '#ef4444') }}>
                            {activeAction.type === 'tambah' && <ArrowDownToLine />}
                            {activeAction.type === 'kurang' && <ArrowUpToLine />}
                            {activeAction.type === 'jual' && <ShoppingCart />}
                            {activeAction.type === 'tambah' ? 'Pencatatan Stok Masuk' : (activeAction.type === 'jual' ? 'Penjualan Barang' : 'Distribusi / Penggunaan')}
                        </h3>
                        <form onSubmit={handleAdjustStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Jumlah ({items.find(i => i.id === activeAction.id)?.satuan})</label>
                                <input type="number" step="0.1" min="0.1" className="search-input" style={{ width: '100%' }} value={adjustData.jumlah} onChange={e => setAdjustData({ ...adjustData, jumlah: e.target.value })} required placeholder="Cth: 5" />
                            </div>

                            {activeAction.type === 'kurang' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Penerima Distribusi (Keluarga Miskin)</label>
                                    <select className="search-input" style={{ width: '100%' }} value={adjustData.household_id} onChange={e => setAdjustData({ ...adjustData, household_id: e.target.value })}>
                                        <option value="">-- Pilih Keluarga / Lainnya --</option>
                                        {households.map(h => (
                                            <option key={h.id} value={h.id}>Keluarga {h.kepala_keluarga} (RT/RW {h.rt_rw})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {activeAction.type === 'jual' && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nama Pembeli</label>
                                        <input type="text" className="search-input" style={{ width: '100%' }} value={adjustData.pembeli} onChange={e => setAdjustData({ ...adjustData, pembeli: e.target.value })} required placeholder="Bapak Budi..." />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Harga Jual (Rp)</label>
                                        <input type="number" min="0" className="search-input" style={{ width: '100%' }} value={adjustData.harga} onChange={e => setAdjustData({ ...adjustData, harga: e.target.value })} required placeholder="150000" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Catatan / Keterangan</label>
                                <textarea className="search-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} value={adjustData.keterangan} onChange={e => setAdjustData({ ...adjustData, keterangan: e.target.value })} placeholder={activeAction.type === 'kurang' ? 'Dibagikan ke warga...' : (activeAction.type === 'jual' ? 'Dijual eceran ke pasar...' : 'Produksi kompos minggu ini...')} required={activeAction.type !== 'jual'} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => { setActiveAction(null); setAdjustData({ jumlah: '', keterangan: '', pembeli: '', harga: '', household_id: '' }); }}>Batal</button>
                                <button type="submit" className="btn" style={{ background: activeAction.type === 'tambah' ? '#10b981' : (activeAction.type === 'jual' ? '#f59e0b' : '#ef4444'), color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {activeAction.type === 'jual' && <ShoppingCart size={16} />}
                                    Konfirmasi {activeAction.type === 'tambah' ? 'Masuk' : (activeAction.type === 'jual' ? 'Penjualan' : 'Keluar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Riwayat Stok */}
            {activeAction && activeAction.type === 'history' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setActiveAction(null)}>
                    <div style={{ background: 'white', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History className="text-primary" /> Riwayat Transaksi: {items.find(i => i.id === activeAction.id)?.nama_barang}
                            </h3>
                            <button onClick={() => setActiveAction(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            {historyData.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888' }}>Belum ada riwayat transaksi.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {historyData.map(h => (
                                        <div key={h.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: h.tipe_perubahan === 'tambah' ? '#ecfdf5' : '#fef2f2' }}>
                                            <div style={{ color: h.tipe_perubahan === 'tambah' ? '#10b981' : '#ef4444' }}>
                                                {h.tipe_perubahan === 'tambah' ? <ArrowDownToLine size={24} /> : <ArrowUpToLine size={24} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong style={{ color: h.tipe_perubahan === 'tambah' ? '#047857' : '#b91c1c' }}>
                                                        {h.tipe_perubahan === 'tambah' ? 'Produksi / Masuk' : 'Distribusi / Keluar'}
                                                    </strong>
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(h.created_at).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.25rem 0', color: '#333' }}>
                                                    {h.tipe_perubahan === 'tambah' ? '+' : '-'}{Number(h.jumlah_perubahan)} {items.find(i => i.id === activeAction.id)?.satuan}
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: '#555', margin: 0 }}>{h.keterangan}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            <div className="search-container" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                <Search className="search-icon" size={18} />
                <input type="text" className="search-input" placeholder="Cari nama kompos atau kerajinan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e1e4e8', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e1e4e8', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Barang Fisik</th>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Kategori</th>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sisa Stok</th>
                            <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'right' }}>Aksi Transaksional</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f2f4' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ background: '#f0f5ff', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                                            <Package size={20} />
                                        </div>
                                        <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{item.nama_barang}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#f5f5f5', borderRadius: '99px', fontSize: '0.75rem', color: '#555', border: `1px solid ${getStockColorClass(item.kategori)}40` }}>
                                        {item.kategori}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{Number(item.kuantitas)}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.satuan}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                        {user && user.role === 'admin' && (
                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.5rem', color: '#10b981', borderColor: '#10b981' }} onClick={() => setActiveAction({ id: item.id, type: 'tambah' })} title="Catat Produksi Masuk">
                                                <Plus size={16} />
                                            </button>
                                        )}
                                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => setActiveAction({ id: item.id, type: 'kurang' })} title="Distribusi / Penggunaan">
                                            <Minus size={16} />
                                        </button>
                                        {user && user.role === 'admin' && (
                                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', background: '#f59e0b', borderColor: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setActiveAction({ id: item.id, type: 'jual' })} title="Jual Barang ke Pembeli">
                                                <ShoppingCart size={16} />
                                                <span style={{ fontSize: '0.8rem' }}>Jual</span>
                                            </button>
                                        )}
                                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.5rem' }} onClick={() => { setActiveAction({ id: item.id, type: 'history' }); fetchHistory(item.id); }} title="Riwayat Transaksi">
                                            <History size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    <Package size={48} style={{ color: '#d9d9d9', margin: '0 auto 1rem' }} />
                                    Belum ada data Kompos atau Kerajinan yang dicatat.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrackingReducing;
