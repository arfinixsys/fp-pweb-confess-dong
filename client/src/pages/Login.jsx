import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      
      // === 🕵️‍♂️ AREA DETEKTIF ===
      console.log("🔥 RESPON ASLI DARI SERVER:", res.data); // Cek ini di Console F12!
      
      // Kita coba cari token di segala kemungkinan tempat
      const token = res.data.token || 
                    res.data.data?.token || 
                    res.data.accessToken || 
                    res.data.data?.accessToken ||
                    res.data.bearer_token; 
      
      if (!token) {
        alert("Gawat! Login sukses tapi Token tidak ditemukan. Cek Console (F12) untuk lihat isinya.");
        console.error("Token hilang! Struktur respon:", res.data);
        return;
      }

      // Simpan token yang sudah pasti ketemu
      localStorage.setItem('token', token);
      
      // Simpan username (cari juga di berbagai tempat)
      const username = res.data.username || res.data.data?.username || form.username;
      localStorage.setItem('user', JSON.stringify({ username }));
      
      alert('Login Berhasil! Token tersimpan: ' + token.substring(0, 10) + '...');
      nav('/');
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert('Login Gagal: ' + (error.response?.data?.message || 'Cek username/password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-primary-500/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-accent/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-dark-800 p-10 rounded-3xl shadow-2xl border border-dark-700 relative z-10 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-slate-400">Masuk untuk mulai mengirim pesan.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Username</label>
              <input type="text" required className="block w-full px-4 py-3 border border-dark-600 placeholder-slate-500 text-white bg-dark-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition" placeholder="Username"
                value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
              <input type="password" required className="block w-full px-4 py-3 border border-dark-600 placeholder-slate-500 text-white bg-dark-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-500 to-accent hover:from-primary-600 hover:to-accent shadow-lg transform transition hover:scale-[1.02] disabled:opacity-70">
            {loading ? 'Memproses...' : 'Masuk Sekarang 🚀'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400">Belum punya akun? <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300 transition underline decoration-primary-500/30">Daftar di sini</Link></p>
      </div>
    </div>
  );
}