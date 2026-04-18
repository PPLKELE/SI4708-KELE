import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Plus, Search, ExternalLink } from 'lucide-react';

const Edukasi = () => {
    const [contents, setContents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [activeModul, setActiveModul] = useState(null);
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        kategori: 'Pertanian',
        tipe_konten: 'Artikel',
        url_konten: ''
    });

    useEffect(() => {
        fetchContents();
    }, []);

    const fetchContents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/edukasi', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setContents(data);
            }
        } catch (error) {
            console.error('Error fetching edukasi contents:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/edukasi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowForm(false);
                setFormData({ judul: '', deskripsi: '', kategori: 'Pertanian', tipe_konten: 'Artikel', url_konten: '' });
                fetchContents();
            }
        } catch (error) {
            console.error('Error submitting edukasi content:', error);
        }
    };

    const filteredContents = contents.filter(c => 
        c.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatExternalUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const handleOpenMaterial = (content) => {
        if (content.url_konten && content.url_konten.startsWith('modal:')) {
            setActiveModul(content.url_konten.split(':')[1]);
        } else if (content.url_konten && content.url_konten.includes('youtube.com/watch?v=')) {
            const videoId = content.url_konten.split('v=')[1]?.split('&')[0];
            setActiveModul(`video:${videoId}`);
        } else {
            // Fallback for standard links
            const anchor = document.createElement('a');
            anchor.href = formatExternalUrl(content.url_konten);
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            anchor.click();
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Edukasi Pekerja</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Materi pelatihan & pengembangan keterampilan</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} />
                    <span>Tambah Konten</span>
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e1e4e8', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Upload Materi Baru</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Judul Materi</label>
                            <input type="text" className="search-input" style={{ width: '100%' }} value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} required placeholder="Contoh: Cara Menanam Sawi" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Deskripsi Singkat</label>
                            <textarea className="search-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} required placeholder="Jelaskan isi materi..." />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Kategori</label>
                                <select className="search-input" style={{ width: '100%' }} value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                                    <option value="Pertanian">Pertanian</option>
                                    <option value="Lingkungan">Lingkungan</option>
                                    <option value="Keterampilan">Keterampilan</option>
                                    <option value="Kesehatan">Kesehatan</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tipe Konten</label>
                                <select className="search-input" style={{ width: '100%' }} value={formData.tipe_konten} onChange={e => setFormData({...formData, tipe_konten: e.target.value})}>
                                    <option value="Artikel">Artikel</option>
                                    <option value="Video">Video</option>
                                    <option value="Panduan PDF">Panduan PDF</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>URL / Link Materi</label>
                            <input type="url" className="search-input" style={{ width: '100%' }} value={formData.url_konten} onChange={e => setFormData({...formData, url_konten: e.target.value})} placeholder="https://..." />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
                            <button type="submit" className="btn btn-primary">Simpan Konten</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="search-container" style={{ flex: 1, maxWidth: '400px' }}>
                    <Search className="search-icon" size={18} />
                    <input type="text" className="search-input" placeholder="Cari judul materi atau kategori..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredContents.map(content => (
                    <div key={content.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f2f4' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: content.tipe_konten === 'Video' ? '#fff1f0' : '#f0f5ff',
                                    color: content.tipe_konten === 'Video' ? '#ff4d4f' : '#2f54eb'
                                }}>
                                    {content.tipe_konten === 'Video' ? <Video size={20} /> : <FileText size={20} />}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '500', background: '#f5f5f5', padding: '0.25rem 0.75rem', borderRadius: '99px', color: '#595959' }}>
                                    {content.kategori}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.4' }}>{content.judul}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {content.deskripsi}
                            </p>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{content.tipe_konten}</span>
                            <button onClick={() => handleOpenMaterial(content)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <span>{content.url_konten?.startsWith('modal:') ? 'Baca Modul' : 'Tonton Video'}</span>
                                {content.url_konten?.startsWith('modal:') ? <BookOpen size={14} /> : <ExternalLink size={14} />}
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredContents.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px dashed #d9d9d9' }}>
                        <BookOpen size={48} style={{ color: '#d9d9d9', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: 'var(--text-main)' }}>Belum ada materi</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Tambahkan materi edukasi pertama untuk pekerja.</p>
                    </div>
                )}
            </div>

            {/* Modul & Video Modal */}
            {activeModul && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setActiveModul(null)}>
                    <div style={{ background: 'white', width: '100%', maxWidth: activeModul.startsWith('video:') ? '900px' : '700px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e1e4e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                {activeModul.startsWith('video:') ? <Video className="text-primary" /> : <BookOpen className="text-primary" />} 
                                {activeModul.startsWith('video:') ? 'Pemutar Video Edukasi' : 'Modul Edukasi Pekerja'}
                            </h2>
                            <button onClick={() => setActiveModul(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6a737d', lineHeight: 1 }}>&times;</button>
                        </div>
                        <div style={{ padding: activeModul.startsWith('video:') ? '0' : '2.5rem', overflowY: 'auto', lineHeight: '1.6', color: '#333', backgroundColor: activeModul.startsWith('video:') ? 'black' : 'white' }}>
                            
                            {/* Video Player */}
                            {activeModul.startsWith('video:') && (
                                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0 }}>
                                    <iframe 
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                        src={`https://www.youtube.com/embed/${activeModul.split(':')[1]}?autoplay=1`} 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {/* Bacaan: Menanam Sayur */}
                            {activeModul === 'menanam-sayur' && (
                                <div>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1a202c' }}>Panduan Lengkap: Cara Menanam Sayur Organik di Pekarangan</h1>
                                    
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>1. Persiapan Lahan dan Media Tanam</h3>
                                    <p style={{ marginBottom: '1rem' }}>Gunakan campuran tanah gembur, pupuk kompos, dan sekam bakar dengan perbandingan 1:1:1. Media tanam ini akan memastikan tanaman mendapatkan nutrisi organik yang cukup tanpa perlu pupuk kimia. Masukkan campuran ke dalam polybag atau bedengan kecil di pekarangan.</p>
                                    
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>2. Menyiapkan Bibit</h3>
                                    <p style={{ marginBottom: '1rem' }}>Pilih bibit sayuran yang mudah tumbuh seperti bayam, kangkung, pakcoy, atau sawi. Semai benih pada tray semai dengan kedalaman 1-2 cm. Simpan di tempat yang teduh dan siram dengan _sprayer_ halus setiap pagi.</p>
                                    
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>3. Memindahkan Bibit Semai</h3>
                                    <p style={{ marginBottom: '1rem' }}>Ketika tanaman sudah memiliki 3-4 helai daun sejati (sekitar 10-14 hari), pindahkan bibit ke pot/polybag yang lebih besar atau bedengan. Lakukan pemindahan pada sore hari agar tanaman tidak layu tersengat matahari.</p>

                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>4. Perawatan dan Panen</h3>
                                    <p style={{ marginBottom: '1rem' }}>Lakukan penyiraman 1-2 kali sehari sesuai cuaca. Untuk mencegah hama, semprotkan pestisida nabati secara rutin sekali seminggu. Sayuran daun biasanya sudah bisa dipanen pada umur 25-30 hari setelah tanam.</p>
                                </div>
                            )}

                            {activeModul === 'kerajinan' && (
                                <div>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1a202c' }}>Keterampilan: Membuat Kerajinan Bernilai Jual dari Barang Bekas</h1>
                                    
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>A. Mengubah Botol Bekas Menjadi Pot Menggantung</h3>
                                    <p style={{ marginBottom: '1rem' }}>Potong botol plastik bekas air mineral menjadi dua bagian. Warnai botol dengan cat akrilik agar lebih menarik. Lubangi bagian sisi botol untuk memasang tali gantungan. Pot ini sangat cocok digunakan dengan metode taman vertikal (vertical garden) yang ditanami tanaman hias.</p>
                                    
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>B. Merajut Plastik Kresek Bekas Menjadi Tas Belanja</h3>
                                    <p style={{ marginBottom: '1rem' }}>Kumpulkan kantong plastik kresek bekas, cuci bersih lalu keringkan. Potong plastik tersebut memanjang dan sambungkan setiap utasnya membentuk tali/benang plastik (sering disebut benang plarn). Rajut menggunakan hakpen ukuran besar. Hasil akhir bisa berupa keranjang multifungsi atau tas belanja tahan air.</p>
                                    
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', color: 'var(--primary)' }}>C. Kerajinan Mosaik dari Pecahan Kaca/Keramik</h3>
                                    <p style={{ marginBottom: '1rem' }}>Pecahan keramik bekas rumah atau mangkuk pecah dapat diubah menjadi hiasan pot, tatakan gelas (coaster), atau meja. Gunakan lem keramik untuk merekatkan pecahan tersebut lalu lumuri celah dengan semen nat agar terlihat tertutup dan artistik bernilai jual tinggi.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Edukasi;
