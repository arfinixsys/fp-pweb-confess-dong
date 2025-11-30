import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NewMessage(){
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [form,setForm] = useState({ sender_name: storedUser.username || '', is_anonymous:true, recipient_name:'', message:'' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // If user is logged in and REQUIRE_LOGIN_TO_SEND enforced, ensure anonymity is off
    const REQUIRE_LOGIN_TO_SEND = import.meta.env.VITE_REQUIRE_LOGIN_TO_SEND === '1' || import.meta.env.VITE_REQUIRE_LOGIN_TO_SEND === 'true';
    if (storedUser.username) {
      setForm(f => ({ ...f, sender_name: storedUser.username }));
      if (REQUIRE_LOGIN_TO_SEND) setForm(f => ({ ...f, is_anonymous: false }));
    }
  }, [storedUser.username]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('sender_name', form.sender_name);
      fd.append('is_anonymous', form.is_anonymous ? 1 : 0);
      fd.append('recipient_name', form.recipient_name);
      fd.append('message', form.message);
      if (image) fd.append('image', image);

      const headers = { 'Content-Type':'multipart/form-data' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await API.post('/messages', fd, { headers });
      alert('Terkirim!');
      nav('/');
    } catch (err) {
      alert(err?.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto card">
      <h2 className="text-2xl font-semibold mb-4">Kirim Confess</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm block">Nama Pengirim (opsional)</label>
          <input value={form.sender_name} onChange={e=>setForm({...form, sender_name:e.target.value})} className="w-full p-2 border rounded" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_anonymous} onChange={e=>setForm({...form, is_anonymous:e.target.checked})} />
          <label>Kirim sebagai anonim</label>
        </div>
        <div>
          <label className="text-sm block">Nama Penerima</label>
          <input required value={form.recipient_name} onChange={e=>setForm({...form, recipient_name:e.target.value})} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm block">Pesan</label>
          <textarea required value={form.message} onChange={e=>setForm({...form, message:e.target.value})} className="w-full p-2 border rounded h-28" />
        </div>
        <div>
          <label className="text-sm block">Gambar (opsional)</label>
          <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} />
        </div>
        <div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading?'Mengirim...':'Kirim'}</button>
        </div>
      </form>
    </div>
  );
}
