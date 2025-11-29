import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NewMessage(){
  const [form,setForm] = useState({ sender_name:'', is_anonymous:true, recipient_name:'', message:'' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

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

      await API.post('/messages', fd, { headers: {'Content-Type':'multipart/form-data'} });
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
