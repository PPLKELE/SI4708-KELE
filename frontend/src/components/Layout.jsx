import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, LogOut, Search, Bell, Mail, FileText, PieChart, DollarSign, BookOpen, Package, ChevronRight, AlertTriangle } from 'lucide-react';

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    // Prevent Pengawas from accessing Admin routes and vice versa
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/pengawas/dashboard'} replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const navItems = user.role === 'admin' 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
        { icon: FileText, label: 'Tugas', to: '/admin/tugas' },
        { icon: PieChart, label: 'Profiling', to: '/admin/profiling' },
        { icon: DollarSign, label: 'Keuangan', to: '/admin/ekonomi' },
        { icon: Users, label: 'Pengawas', to: '/admin/pengawas' },
        { icon: BookOpen, label: 'Edukasi', to: '/admin/edukasi' },
        { icon: Package, label: 'Inventaris', to: '/admin/inventaris' }
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard Pengawas', to: '/pengawas/dashboard' },
        { icon: Calendar, label: 'Logbook Validasi', to: '/pengawas/logbook' },
        { icon: DollarSign, label: 'Insentif & Upah', to: '/pengawas/ekonomi' },
        { icon: AlertTriangle, label: 'Pelaporan Masalah', to: '/pengawas/pelaporan' }
      ];

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
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="topbar">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input type="text" className="search-input" placeholder="Cari data, tugas, atau profiling..." />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <div className="badge-dot"></div>
            </button>
            <button className="icon-btn">
              <Mail size={20} />
            </button>
            <div className="user-profile">
              <div className="user-info">
                <div className="user-name">{user.nama || 'Asep Kumala'}</div>
                <div className="user-role">{user.role === 'admin' ? 'Administrator' : 'Pengawas'}</div>
              </div>
              <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="avatar" />
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
