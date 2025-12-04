import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await API.post('/admin/login', form); // ← pastikan endpoint ini
    console.log('Response login:', res.data); // ← tambahkan ini untuk debug
    
    const token = res.data.token;
    if (!token) throw new Error('Token admin tidak ditemukan');

    localStorage.setItem('adminToken', token);
    console.log('Token tersimpan:', token); // ← tambahkan ini
    
    alert('Login Admin Berhasil!');
    nav('/admin');
  } catch (err) {
    console.error('Error login:', err); // ← tambahkan ini
    alert('Login Admin Gagal: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <form className="bg-dark-800 p-8 rounded-xl shadow-lg w-full max-w-sm" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold text-white mb-6">Admin Login</h2>
        <input 
          type="text" 
          placeholder="Username" 
          value={form.username} 
          onChange={e => setForm({...form, username:e.target.value})} 
          className="w-full p-3 mb-4 rounded-lg bg-dark-900 border border-dark-700 text-white"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={e => setForm({...form, password:e.target.value})} 
          className="w-full p-3 mb-4 rounded-lg bg-dark-900 border border-dark-700 text-white"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Memproses...' : 'Login Admin'}
        </button>
      </form>
    </div>
  );
}
