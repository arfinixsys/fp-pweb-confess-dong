import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  // Menyesuaikan screenshot kamu: ada Email & Confirm Password
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana di Frontend
    if(form.password !== form.confirmPassword) {
      alert('Password dan Konfirmasi tidak sama!');
      return;
    }

    setLoading(true);
    try {
      // Kirim data ke backend (sesuaikan field yg backend minta)
      // Kalau backend cuma butuh username & password, email akan diabaikan (aman)
      await API.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password
      });
      
      alert('Registrasi Berhasil! Silakan Login.');
      nav('/login');
    } catch (error) {
      alert('Gagal Daftar: ' + (error.response?.data?.message || 'Coba username lain'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
       {/* Background decoration */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-dark-800 p-10 rounded-3xl shadow-2xl border border-dark-700 relative z-10 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Gabung komunitas Confess Dong sekarang.
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 border border-dark-600 placeholder-slate-600 text-white bg-dark-900 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="User123"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 border border-dark-600 placeholder-slate-600 text-white bg-dark-900 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 border border-dark-600 placeholder-slate-600 text-white bg-dark-900 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Konfirmasi Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 border border-dark-600 placeholder-slate-600 text-white bg-dark-900 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-accent to-purple-600 hover:from-accent hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent shadow-lg shadow-accent/30 transform transition hover:scale-[1.02] mt-6 disabled:opacity-70"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Akun ✨'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-purple-300 transition underline decoration-accent/30">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}