import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);
    
    try {
      const res = await API.post('/auth/register', { 
        username: form.username, 
        email: form.email, 
        password: form.password 
      });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        alert('Registrasi berhasil!');
        nav('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto card mt-10">
      <h2 className="text-2xl font-semibold mb-4">Daftar Akun</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-sm block mb-1">Username</label>
          <input 
            type="text"
            value={form.username} 
            onChange={e=>setForm({...form, username: e.target.value})} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Email</label>
          <input 
            type="email"
            value={form.email} 
            onChange={e=>setForm({...form, email: e.target.value})} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Password</label>
          <input 
            type="password"
            value={form.password} 
            onChange={e=>setForm({...form, password: e.target.value})} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Konfirmasi Password</label>
          <input 
            type="password"
            value={form.confirmPassword} 
            onChange={e=>setForm({...form, confirmPassword: e.target.value})} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary w-full" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Daftar'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        Sudah punya akun? <a href="/login" className="text-primary-500">Login di sini</a>
      </div>
    </div>
  );
}
