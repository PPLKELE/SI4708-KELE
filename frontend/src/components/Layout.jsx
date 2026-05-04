import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserSquare, Calendar, LogOut, Search, Bell, Mail, FileText, PieChart, DollarSign, BookOpen, Package, ChevronRight, BarChart2, AlertTriangle, MapPin, Leaf, ShieldCheck, TrendingUp, UserCircle, Send, Check } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Icon size={20} />
      <span>{label}</span>
    </div>
    {active && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
  </Link>
);

export const Layout = ({ requireRole }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const [messages, setMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showMsg, setShowMsg] = useState(false);
  const [composeMsg, setComposeMsg] = useState({ receiver_id: '', pesan: '' });

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const msgRef = useRef(null);

  const navItems = user?.role === 'admin' 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard Admin', to: '/admin/dashboard' },
        { icon: BarChart2, label: 'Dashboard Analisis', to: '/admin/analisis' },
        { icon: Users, label: 'Data Pekerja', to: '/admin/pekerja' },
        { icon: UserSquare, label: 'Keluarga Miskin', to: '/admin/keluarga' },
        { icon: MapPin, label: 'Perencanaan Program', to: '/admin/perencanaan' },
        { icon: Calendar, label: 'Program Mikro', to: '/admin/program' },
        { icon: PieChart, label: 'Profiling', to: '/admin/profiling' },
        { icon: DollarSign, label: 'Keuangan', to: '/admin/ekonomi' },
        { icon: Users, label: 'Pengawas', to: '/admin/pengawas' },
        { icon: BookOpen, label: 'Edukasi', to: '/admin/edukasi' },
        { icon: Package, label: 'Inventaris', to: '/admin/inventaris' },
        { icon: ShieldCheck, label: 'Pengaturan Akses', to: '/admin/roles' },
        { icon: TrendingUp, label: 'Tren Produktivitas', to: '/admin/produktivitas' }
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard Pengawas', to: '/pengawas/dashboard' },
        { icon: Calendar, label: 'Logbook Validasi', to: '/pengawas/logbook' },
        { icon: DollarSign, label: 'Insentif & Upah', to: '/pengawas/ekonomi' },
        { icon: AlertTriangle, label: 'Pelaporan Masalah', to: '/pengawas/pelaporan' }
      ];

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchMessages();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (msgRef.current && !msgRef.current.contains(event.target)) setShowMsg(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notifications', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setNotifications(data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/messages', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users/list', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setUsersList(data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      setShowSearch(true);
      // Static Nav Search
      const navResults = navItems.filter(n => n.label.toLowerCase().includes(q.toLowerCase())).map(n => ({ type: 'Menu', title: n.label, desc: 'Halaman Navigasi', link: n.to }));
      
      // Backend Data Search
      try {
        const res = await fetch(`http://localhost:4000/api/search?q=${q}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        const data = await res.json();
        setSearchResults([...navResults, ...data]);
      } catch (err) {
        setSearchResults(navResults);
      }
    } else {
      setShowSearch(false);
    }
  };

  const markNotifRead = async (id) => {
    await fetch(`http://localhost:4000/api/notifications/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    fetchNotifications();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!composeMsg.receiver_id || !composeMsg.pesan) return;
    try {
      await fetch('http://localhost:4000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(composeMsg)
      });
      setComposeMsg({ receiver_id: '', pesan: '' });
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/pengawas/dashboard'} replace />;
  }

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>W</div>
          <span style={{ color: 'var(--text-main)' }}>Work4Village</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => (
            <SidebarItem 
              key={idx} 
              icon={item.icon} 
              label={item.label} 
              to={item.to} 
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="topbar">
          <div className="search-container" ref={searchRef} style={{ position: 'relative' }}>
            <Search className="search-icon" size={18} />
            <input type="text" className="search-input" placeholder="Cari navigasi, pekerja, atau program..." value={searchQuery} onChange={handleSearch} onClick={() => { if (searchQuery.length > 2) setShowSearch(true); }} />
            
            {showSearch && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '300px', overflowY: 'auto' }}>
                {searchResults.map((r, i) => (
                  <div key={i} onClick={() => { navigate(r.link); setShowSearch(false); }} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{r.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.type} &bull; {r.desc}</span>
                  </div>
                ))}
              </div>
            )}
            {showSearch && searchResults.length === 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Tidak ada hasil ditemukan.
              </div>
            )}
          </div>

          <div className="topbar-actions">
            
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => { setShowNotif(!showNotif); fetchNotifications(); }}>
                <Bell size={20} />
                {unreadNotifs > 0 && <div className="badge-dot" style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: 'red', borderRadius: '50%' }}></div>}
              </button>
              {showNotif && (
                <div style={{ position: 'absolute', right: 0, top: '120%', width: '300px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 60, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>Notifikasi</div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada notifikasi</div>
                    ) : notifications.map(n => (
                      <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', background: n.is_read ? 'white' : '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{n.judul}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.pesan}</div>
                        </div>
                        {!n.is_read && <button onClick={() => markNotifRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Check size={16}/></button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div ref={msgRef} style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => { setShowMsg(!showMsg); fetchMessages(); fetchUsers(); }}>
                <Mail size={20} />
              </button>
              {showMsg && (
                <div style={{ position: 'absolute', right: 0, top: '120%', width: '320px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 60, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>Pesan Internal</div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.5rem' }}>
                    {messages.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada pesan</div>
                    ) : messages.map(m => {
                      const isMe = m.sender_id === user.id;
                      return (
                        <div key={m.id} style={{ marginBottom: '0.5rem', textAlign: isMe ? 'right' : 'left' }}>
                          <div style={{ display: 'inline-block', maxWidth: '85%', background: isMe ? 'var(--primary)' : '#f1f5f9', color: isMe ? 'white' : 'var(--text-main)', padding: '0.5rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px' }}>{isMe ? 'Anda' : m.sender_name}</div>
                            {m.pesan}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <form onSubmit={sendMessage} style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc' }}>
                    <select value={composeMsg.receiver_id} onChange={e => setComposeMsg({...composeMsg, receiver_id: e.target.value})} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} required>
                      <option value="">Pilih Penerima...</option>
                      {usersList && usersList.length > 0 ? usersList.map(u => <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>) : <option value="" disabled>Memuat daftar pengguna...</option>}
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" placeholder="Tulis pesan..." value={composeMsg.pesan} onChange={e => setComposeMsg({...composeMsg, pesan: e.target.value})} required style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                      <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={16}/></button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="user-profile">
              <div className="user-info">
                <div className="user-name">{user.nama || 'Asep Kumala'}</div>
                <div className="user-role">{user.role === 'admin' ? 'Administrator' : 'Pengawas'}</div>
              </div>
              <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', color: '#4f46e5' }}>
                <UserCircle size={28} />
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
