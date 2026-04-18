import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import DataPekerja from './pages/admin/DataPekerja';
import Edukasi from './pages/Edukasi';
import Inventaris from './pages/admin/Inventaris';
import PengawasDashboard from './pages/pengawas/Dashboard';
import Logbook from './pages/pengawas/Logbook';
import EkonomiInsentif from './pages/EkonomiInsentif';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout requireRole="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pekerja" element={<DataPekerja />} />
            <Route path="ekonomi" element={<EkonomiInsentif />} />
            <Route path="edukasi" element={<Edukasi />} />
            <Route path="inventaris" element={<Inventaris />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Pengawas Routes */}
          <Route path="/pengawas" element={<Layout requireRole="pengawas" />}>
            <Route path="dashboard" element={<PengawasDashboard />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="ekonomi" element={<EkonomiInsentif />} />
            <Route index element={<Navigate to="/pengawas/dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
