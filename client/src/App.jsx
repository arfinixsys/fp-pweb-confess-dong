import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewMessage from './pages/NewMessage';
import MessageDetail from './pages/MessageDetails';
import AdminPanel from './pages/AdminPanel';

// Komponen Navbar
const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  // Parsing User agar aman
  let username = 'User';
  try {
    const userObj = JSON.parse(userStr);
    username = userObj.username || userStr;
  } catch (e) {
    username = userStr;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 transition-all shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent bg-clip-text text-transparent flex items-center gap-2">
            Confess Dong 🤫
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">Home</Link>
            
            {token ? (
              <>
                <Link to="/new" className="hidden sm:block bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary-500/30 transition transform hover:scale-105">
                  + Buat Pesan
                </Link>
                <Link to="/admin" className="text-slate-400 hover:text-white text-sm font-medium">Admin</Link>
                <div className="flex items-center gap-3 pl-4 border-l border-dark-700 ml-2">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">Login sebagai</p>
                    <p className="text-accent font-bold text-sm">{username}</p>
                  </div>
                  <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-xs border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm">Masuk</Link>
                <Link to="/register" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// === BAGIAN INI YANG TADI MUNGKIN HILANG ===
export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<NewMessage />} />
          <Route path="/messages/:id" element={<MessageDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </>
  );
}