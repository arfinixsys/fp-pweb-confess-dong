import React, { useState, useEffect } from 'react'; // Tambah useEffect
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NewMessage(){
  // Default sender_name kosong dulu
  const [form, setForm] = useState({ sender_name:'', is_anonymous:true, recipient_name:'', message:'' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // === FITUR BARU: AUTO-FILL NAMA USER ===
  useEffect(() => {
    try {
      // Ambil data user dari LocalStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        // Kalau ada username, masukkan ke form
        if (userObj.username) {
          setForm(prev => ({ ...prev, sender_name: userObj.username }));
        }
      }
    } catch (e) {
      console.log("Gagal auto-fill nama user");
    }
  }, []);
  // =======================================

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      // Kalau mode anonim, sender_name diabaikan atau diset 'Anonim'
      // Tapi kita kirim saja apa adanya, biar backend yang atur logic-nya
      fd.append('sender_name', form.sender_name);
      fd.append('is_anonymous', form.is_anonymous ? 1 : 0);
      fd.append('recipient_name', form.recipient_name);
      fd.append('message', form.message);
      if (image) fd.append('image', image);

      await API.post('/messages', fd, { headers: {'Content-Type':'multipart/form-data'} });
      alert('Pesan Terkirim! 🚀'); // Kasih feedback sukses
      nav('/');
    } catch (err) {
      console.error(err);
      alert('Gagal Kirim: ' + (err?.response?.data?.message || 'Token Expired/Server Error'));
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-accent p-6 text-white">
          <h2 className="text-2xl font-bold">Tulis Confession Baru ✍️</h2>
          <p className="opacity-90 text-sm">Identitasmu aman. Jangan ragu untuk bercerita.</p>
        </div>
        
        <form onSubmit={submit} className="p-8 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-dark-900 rounded-xl border border-dark-700 hover:border-primary-500/50 transition">
            <input type="checkbox" className="w-5 h-5 accent-primary-500 cursor-pointer" checked={form.is_anonymous} onChange={e=>setForm({...form, is_anonymous:e.target.checked})} />
            <label className="text-slate-300 font-medium cursor-pointer">Kirim sebagai Anonim</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Dari (Opsional)</label>
              <input value={form.sender_name} onChange={e=>setForm({...form, sender_name:e.target.value})} disabled={form.is_anonymous}
                className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={form.is_anonymous ? "Mode Anonim Aktif" : "Nama Kamu"} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Kepada <span className="text-red-500">*</span></label>
              <input required value={form.recipient_name} onChange={e=>setForm({...form, recipient_name:e.target.value})} 
                className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                placeholder="Nama Target / Inisial" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pesan <span className="text-red-500">*</span></label>
            <textarea required value={form.message} onChange={e=>setForm({...form, message:e.target.value})} 
              className="w-full bg-dark-900 border border-dark-700 text-white p-4 rounded-lg h-32 focus:ring-2 focus:ring-primary-500 outline-none transition resize-none placeholder-slate-600"
              placeholder="Tumpahkan perasaanmu di sini..." />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Gambar (Opsional)</label>
            <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-dark-900 file:text-primary-500 hover:file:bg-dark-700 cursor-pointer" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary-500 to-accent hover:from-primary-600 hover:to-accent text-white font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Sedang Mengirim...' : '🚀 Kirim Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}