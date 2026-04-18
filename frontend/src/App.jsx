import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DataPekerja from './pages/admin/DataPekerja';
import PengawasDashboard from './pages/pengawas/Dashboard';
import Logbook from './pages/pengawas/Logbook';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout requireRole="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pekerja" element={<DataPekerja />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Pengawas Routes */}
          <Route path="/pengawas" element={<Layout requireRole="pengawas" />}>
            <Route path="dashboard" element={<PengawasDashboard />} />
            <Route path="logbook" element={<Logbook />} />
            <Route index element={<Navigate to="/pengawas/dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
