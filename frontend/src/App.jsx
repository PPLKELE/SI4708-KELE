import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import DashboardAnalisis from './pages/admin/DashboardAnalisis';
import DataPekerja from './pages/admin/DataPekerja';
import Edukasi from './pages/Edukasi';

import UserManagement from './pages/admin/UserManagement';
import DataKeluarga from './pages/admin/DataKeluarga';
import ProgramKerja from './pages/admin/ProgramKerja';
import PengawasDashboard from './pages/pengawas/Dashboard';
import Logbook from './pages/pengawas/Logbook';
import DistribusiHasil from './pages/pengawas/DistribusiHasil';
import EkonomiInsentif from './pages/EkonomiInsentif';
<<<<<<< HEAD
import JadwalKerja from './pages/JadwalKerja';
=======
import PelaporanMasalah from './pages/PelaporanMasalah';
import PerencanaanProgram from './pages/admin/PerencanaanProgram';
import Produktivitas from './pages/admin/Produktivitas';
<<<<<<< HEAD
>>>>>>> 3d11035b4cf8fd9373bbc1203221046b213662ba
=======
import TrackingReducing from './pages/admin/TrackingReducing';
>>>>>>> 89e1b6d111e5e41cc027f670300ae3ca625053d9

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
            <Route path="analisis" element={<DashboardAnalisis />} />
            <Route path="pekerja" element={<DataPekerja />} />
            <Route path="ekonomi" element={<EkonomiInsentif />} />
<<<<<<< HEAD
            <Route path="jadwal" element={<JadwalKerja />} />
=======
            <Route path="edukasi" element={<Edukasi />} />

            <Route path="pengawas" element={<PelaporanMasalah />} />
            <Route path="perencanaan" element={<PerencanaanProgram />} />
            <Route path="keluarga" element={<DataKeluarga />} />
            <Route path="program" element={<ProgramKerja />} />
            <Route path="roles" element={<UserManagement />} />
            <Route path="produktivitas" element={<Produktivitas />} />
<<<<<<< HEAD
>>>>>>> 3d11035b4cf8fd9373bbc1203221046b213662ba
=======
            <Route path="tracking-reducing" element={<TrackingReducing />} />
>>>>>>> 89e1b6d111e5e41cc027f670300ae3ca625053d9
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Pengawas Routes */}
          <Route path="/pengawas" element={<Layout requireRole="pengawas" />}>
            <Route path="dashboard" element={<PengawasDashboard />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="distribusi" element={<DistribusiHasil />} />
            <Route path="ekonomi" element={<EkonomiInsentif />} />
<<<<<<< HEAD
            <Route path="jadwal" element={<JadwalKerja />} />
=======
            <Route path="pelaporan" element={<PelaporanMasalah />} />
>>>>>>> 3d11035b4cf8fd9373bbc1203221046b213662ba
            <Route index element={<Navigate to="/pengawas/dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
