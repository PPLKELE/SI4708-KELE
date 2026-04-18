import React, { useState, useEffect, useCallback } from 'react';
import { Coins, Award, RefreshCw, TrendingUp } from 'lucide-react';

const API = 'http://localhost:4000/api';

const fmtIdr = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(n) || 0
  );

const EkonomiInsentif = () => {
  const [workers, setWorkers] = useState([]);
  const [workerId, setWorkerId] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [akumulasi, setAkumulasi] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadDetail, setLoadDetail] = useState(false);

  const [insForm, setInsForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah_upah: '',
    jenis_insentif: 'Upah Harian',
    keterangan: ''
  });
  const [rewForm, setRewForm] = useState({
    nama_penghargaan: '',
    tanggal_pemberian: new Date().toISOString().slice(0, 10)
  });
  const [msg, setMsg] = useState(null);

  const tokenHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/workers`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const data = await res.json();
        setWorkers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, []);

  const loadWorkerEconomy = useCallback(async () => {
    if (!workerId) {
      setAkumulasi(null);
      setRiwayat([]);
      setRewards([]);
      return;
    }
    setLoadDetail(true);
    setMsg(null);
    try {
      const q = `tahun=${tahun}&bulan=${bulan}`;
      const [aRes, rRes, rwRes] = await Promise.all([
        fetch(`${API}/insentif/akumulasi/${workerId}?${q}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API}/insentif/riwayat/${workerId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API}/rewards/riwayat/${workerId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      const aJson = await aRes.json();
      const rJson = await rRes.json();
      const rwJson = await rwRes.json();
      if (!aRes.ok) throw new Error(aJson.error || 'Gagal memuat akumulasi');
      setAkumulasi(aJson);
      setRiwayat(rJson.riwayat || []);
      setRewards(rwJson.riwayat || []);
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setLoadDetail(false);
    }
  }, [workerId, tahun, bulan, refreshKey]);

  useEffect(() => {
    loadWorkerEconomy();
  }, [loadWorkerEconomy]);

  const submitInsentif = async (e) => {
    e.preventDefault();
    if (!workerId) return setMsg({ type: 'err', text: 'Pilih pekerja terlebih dahulu.' });
    try {
      const res = await fetch(`${API}/insentif`, {
        method: 'POST',
        headers: tokenHeaders(),
        body: JSON.stringify({
          worker_id: Number(workerId),
          tanggal: insForm.tanggal,
          jumlah_upah: Number(insForm.jumlah_upah),
          jenis_insentif: insForm.jenis_insentif,
          keterangan: insForm.keterangan || null
        })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Gagal menyimpan');
      setMsg({ type: 'ok', text: 'Insentif / upah berhasil dicatat.' });
      setInsForm((f) => ({ ...f, jumlah_upah: '', keterangan: '' }));
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  };

  const submitReward = async (e) => {
    e.preventDefault();
    if (!workerId) return setMsg({ type: 'err', text: 'Pilih pekerja terlebih dahulu.' });
    try {
      const res = await fetch(`${API}/rewards`, {
        method: 'POST',
        headers: tokenHeaders(),
        body: JSON.stringify({
          worker_id: Number(workerId),
          nama_penghargaan: rewForm.nama_penghargaan,
          tanggal_pemberian: rewForm.tanggal_pemberian
        })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Gagal menyimpan');
      setMsg({ type: 'ok', text: 'Penghargaan berhasil dicatat.' });
      setRewForm((f) => ({ ...f, nama_penghargaan: '' }));
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  };

  const selectedWorker = workers.find((w) => String(w.id) === String(workerId));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Coins size={28} className="text-primary" style={{ color: 'var(--primary)' }} />
          Ekonomi & Insentif
        </h1>
        <p>Catat upah / voucher, penghargaan, dan pantau akumulasi pendapatan bulanan pekerja.</p>
      </div>

      {msg && (
        <div
          className="glass-panel"
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1.25rem',
            borderLeft: `4px solid ${msg.type === 'ok' ? 'var(--primary)' : 'var(--danger)'}`,
            color: msg.type === 'ok' ? 'var(--text-main)' : 'var(--danger)'
          }}
        >
          {msg.text}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Pilih pekerja</label>
          <select
            className="form-input"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            disabled={loadingList}
          >
            <option value="">— Pilih —</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                #{w.id} — {w.nama}
              </option>
            ))}
          </select>
        </div>
        {selectedWorker && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Keahlian: <span className="badge badge-success">{selectedWorker.kemampuan_utama || 'Umum'}</span>
          </p>
        )}
      </div>

      {workerId && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} /> Akumulasi upah (bulanan)
              </h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '100px' }}>
                  <label className="form-label">Bulan</label>
                  <select className="form-input" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1', minWidth: '120px' }}>
                  <label className="form-label">Tahun</label>
                  <input
                    type="number"
                    className="form-input"
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    min={2000}
                    max={2100}
                  />
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setRefreshKey((k) => k + 1)} disabled={loadDetail}>
                    <RefreshCw size={16} style={{ marginRight: 6 }} />
                    Muat ulang
                  </button>
                </div>
              </div>
              {loadDetail && !akumulasi ? (
                <p style={{ color: 'var(--text-muted)' }}>Menghitung…</p>
              ) : akumulasi ? (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {fmtIdr(akumulasi.total_upah)}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Periode {akumulasi.periode?.label} · {akumulasi.jumlah_entri} entri
                  </p>
                  {akumulasi.per_jenis?.length > 0 && (
                    <ul style={{ marginTop: '1rem', paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
                      {akumulasi.per_jenis.map((p) => (
                        <li key={p.jenis_insentif}>
                          {p.jenis_insentif}: <strong>{fmtIdr(p.subtotal)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : null}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Catat insentif / upah</h3>
              <form onSubmit={submitInsentif} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={insForm.tanggal}
                    onChange={(e) => setInsForm({ ...insForm, tanggal: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis</label>
                  <select
                    className="form-input"
                    value={insForm.jenis_insentif}
                    onChange={(e) => setInsForm({ ...insForm, jenis_insentif: e.target.value })}
                  >
                    <option>Upah Harian</option>
                    <option>Voucher Pangan</option>
                    <option>Insentif Langsung</option>
                    <option>Lainnya (isi keterangan)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah (rupiah / nilai setara)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min={0}
                    step={1000}
                    placeholder="50000"
                    value={insForm.jumlah_upah}
                    onChange={(e) => setInsForm({ ...insForm, jumlah_upah: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Keterangan</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Program / tugas / catatan validasi"
                    value={insForm.keterangan}
                    onChange={(e) => setInsForm({ ...insForm, keterangan: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Simpan insentif
                </button>
              </form>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} /> Penghargaan
              </h3>
              <form onSubmit={submitReward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama penghargaan</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Pekerja teladan, sertifikat partisipasi, dll."
                    value={rewForm.nama_penghargaan}
                    onChange={(e) => setRewForm({ ...rewForm, nama_penghargaan: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal pemberian</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={rewForm.tanggal_pemberian}
                    onChange={(e) => setRewForm({ ...rewForm, tanggal_pemberian: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-outline">
                  Simpan penghargaan
                </button>
              </form>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="ekonomi-grid-two">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Riwayat insentif</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayat.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          Belum ada data.
                        </td>
                      </tr>
                    ) : (
                      riwayat.map((r) => (
                        <tr key={r.id}>
                          <td>{r.tanggal}</td>
                          <td>
                            <span className="badge badge-success">{r.jenis_insentif}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{fmtIdr(r.jumlah_upah)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Riwayat penghargaan</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Nama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          Belum ada data.
                        </td>
                      </tr>
                    ) : (
                      rewards.map((r) => (
                        <tr key={r.id}>
                          <td>{r.tanggal_pemberian}</td>
                          <td>{r.nama_penghargaan}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .ekonomi-grid-two { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default EkonomiInsentif;
