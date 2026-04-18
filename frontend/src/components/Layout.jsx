import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserSquare, Calendar, LogOut, Leaf, Coins } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
    <Icon size={20} />
    <span>{label}</span>
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
        { icon: LayoutDashboard, label: 'Dashboard Admin', to: '/admin/dashboard' },
        { icon: Users, label: 'Data Pekerja', to: '/admin/pekerja' },
        { icon: Coins, label: 'Insentif & Upah', to: '/admin/ekonomi' },
        { icon: UserSquare, label: 'Keluarga Miskin', to: '#keluarga' },
        { icon: Calendar, label: 'Program Mikro', to: '#program' }
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard Pengawas', to: '/pengawas/dashboard' },
        { icon: Calendar, label: 'Logbook Validasi', to: '/pengawas/logbook' },
        { icon: Coins, label: 'Insentif & Upah', to: '/pengawas/ekonomi' }
      ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Leaf size={28} />
          <span>Work4Village</span>
        </div>
        
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Role Aktif</div>
          <div style={{ fontWeight: '600', color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{user.nama}</div>
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
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
            <LogOut size={20} />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
