import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function AdminPanel() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Token admin tidak ditemukan. Redirect ke login...');
        nav('/admin/login'); // ← redirect otomatis
        return;
      }

      setLoading(true);
      const res = await API.get('/admin/messages', { 
        headers: { 'x-admin-token': token } 
      });
      
      setMsgs(res.data.data || []);
    } catch (err) {
      console.error('Error loadMessages:', err);
      
      // Kalau 401 (unauthorized), redirect ke login
      if (err.response?.status === 401) {
        alert('Sesi admin expired. Login ulang.');
        localStorage.removeItem('adminToken');
        nav('/admin/login');
        return;
      }
      
      alert('Gagal memuat pesan admin: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve message ini?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await API.patch(`/messages/${id}/approve`, { is_approved: true }, { 
        headers: { 'x-admin-token': token } 
      });
      alert('Message approved!');
      loadMessages();
    } catch (err) { 
      alert('Error: ' + (err.response?.data?.message || err.message)); 
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm('Soft delete message ini?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await API.delete(`/messages/${id}/soft`, { 
        headers: { 'x-admin-token': token } 
      });
      alert('Message soft deleted!');
      loadMessages();
    } catch (err) { 
      alert('Error: ' + (err.response?.data?.message || err.message)); 
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm('Hapus PERMANEN? Tidak bisa dikembalikan!')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await API.delete(`/messages/${id}`, { 
        headers: { 'x-admin-token': token } 
      });
      alert('Message deleted permanently!');
      loadMessages();
    } catch (err) { 
      alert('Error: ' + (err.response?.data?.message || err.message)); 
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout dari admin?')) {
      localStorage.removeItem('adminToken');
      nav('/admin/login');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-white font-bold">Admin Dashboard</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <button 
        onClick={loadMessages} 
        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg mb-4"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>

      {loading ? (
        <p className="text-white text-center">Memuat pesan...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {msgs.length === 0 ? (
            <p className="text-slate-400 col-span-3 text-center">Tidak ada pesan.</p>
          ) : msgs.map(m => (
            <div key={m.id} className="bg-dark-800 p-4 rounded-lg border border-dark-700">
              <div className="flex justify-between items-start mb-2">
                <p className="text-white font-bold truncate flex-1">
                  {m.sender_name} → {m.recipient_name}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  m.is_approved ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {m.is_approved ? '✓ Approved' : '✗ Pending'}
                </span>
              </div>
              <p className="text-slate-300 mt-2 line-clamp-3">{m.message}</p>
              {m.image_path && (
                <img 
                  src={m.image_path} 
                  alt="" 
                  className="mt-2 rounded max-h-32 object-cover w-full"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={()=>handleApprove(m.id)} 
                  className="px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-xs"
                >
                  ✅ Approve
                </button>
                <button 
                  onClick={()=>handleSoftDelete(m.id)} 
                  className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-white text-xs"
                >
                  🗑️ Soft
                </button>
                <button 
                  onClick={()=>handleHardDelete(m.id)} 
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs"
                >
                  💀 Hard
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                ID: {m.id} | Likes: {m.likes_count} | Reports: {m.reports_count}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
