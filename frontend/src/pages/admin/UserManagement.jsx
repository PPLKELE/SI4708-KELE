import React, { useState, useEffect } from 'react';
import { Shield, User, AlertCircle, CheckCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Role berhasil diperbarui!' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui role.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    }
    
    // Clear message after 3s
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Manajemen Akses & Role</h1>
        <p>Atur hak akses untuk Admin, Pengawas, Supervisor, dan Relawan.</p>
      </div>

      {message.text && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pengguna</th>
              <th>Email</th>
              <th>Role Saat Ini</th>
              <th>Ubah Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Memuat data pengguna...</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td># {u.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--background-alt)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <User size={16} />
                    </div>
                    {u.nama}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-outline'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <select 
                    className="form-input" 
                    style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="pengawas">Pengawas</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="relawan">Relawan</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
