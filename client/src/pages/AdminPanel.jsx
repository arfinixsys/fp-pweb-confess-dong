import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminPanel(){
  const [msgs,setMsgs] = useState([]);
  const token = import.meta.env.VITE_ADMIN_TOKEN || prompt('Masukkan admin token:');
  useEffect(()=> {
    API.get('/admin/messages', { headers: { 'x-admin-token': token}})
      .then(r=> setMsgs(r.data.data))
      .catch(function () { alert('Auth failed'); });
  }, []);
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
              <button className="px-3 py-1 border rounded">Approve</button>
              <button className="px-3 py-1 border rounded">Soft Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
