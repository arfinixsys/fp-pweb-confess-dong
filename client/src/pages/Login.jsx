import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await API.post('/auth/login', { username, password });
      if (res.data.success) {
        // Save token to localStorage
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        alert('Login successful!');
        nav('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto card mt-10">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm block mb-1">Username</label>
          <input 
            type="text"
            value={username} 
            onChange={e=>setUsername(e.target.value)} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Password</label>
          <input 
            type="password"
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary w-full" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        Belum punya akun? <a href="/register" className="text-primary-500">Daftar sekarang</a>
      </div>
    </div>
  );
}
