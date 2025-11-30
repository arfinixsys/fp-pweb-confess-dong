import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminPanel(){
  const [msgs,setMsgs] = useState([]);
  const token = import.meta.env.VITE_ADMIN_TOKEN || prompt('Masukkan admin token:');
  
  useEffect(()=> {
    loadMessages();
  }, []);

  const loadMessages = () => {
    API.get('/admin/messages', { headers: { 'x-admin-token': token}})
      .then(r=> setMsgs(r.data.data))
      .catch(function () { alert('Auth failed'); });
  };

  const handleApprove = (id) => {
    if (confirm('Approve message ini?')) {
      API.patch(`/messages/${id}/approve`, { is_approved: 1 }, { headers: { 'x-admin-token': token } })
        .then(() => {
          alert('Message approved');
          loadMessages();
        })
        .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleSoftDelete = (id) => {
    if (confirm('Soft delete message ini?')) {
      API.delete(`/messages/${id}/soft`, { headers: { 'x-admin-token': token } })
        .then(() => {
          alert('Message soft deleted');
          loadMessages();
        })
        .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleHardDelete = (id) => {
    if (confirm('PERHATIAN: Hard delete akan menghapus pesan PERMANEN dari database. Lanjutkan?')) {
      API.delete(`/messages/${id}`, { headers: { 'x-admin-token': token } })
        .then(() => {
          alert('Message permanently deleted');
          loadMessages();
        })
        .catch(err => alert('Error: ' + err.message));
    }
  };
  return (
    <div>
      <h2 className="text-2xl mb-4">Admin Panel</h2>
      <div className="space-y-4">
        {msgs.map(m => (
          <div key={m.id} className="card">
            <div className="flex justify-between">
              <div>
                <div>To: {m.recipient_name}</div>
                <div>From: {m.sender_name}</div>
              </div>
              <div>{new Date(m.created_at).toLocaleString()}</div>
            </div>
            <p className="mt-2">{m.message}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => handleApprove(m.id)} className="px-3 py-1 border rounded bg-green-500 text-white hover:bg-green-600">Approve</button>
              <button onClick={() => handleSoftDelete(m.id)} className="px-3 py-1 border rounded bg-red-500 text-white hover:bg-red-600">Soft Delete</button>
              <button onClick={() => handleHardDelete(m.id)} className="px-3 py-1 border rounded bg-red-800 text-white hover:bg-red-900">Hard Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
