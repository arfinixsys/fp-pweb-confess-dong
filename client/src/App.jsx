import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NewMessage from './pages/NewMessage';
import MessageDetails from './pages/MessageDetails';
import AdminPanel from './pages/AdminPanel';
import MessageList from './pages/MessageList';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

export default function App(){
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div>
      <header className="p-4 flex justify-between items-center border-b">
        <Link to="/" className="text-xl font-bold text-primary-500">Confess Dong</Link>
        <nav className="space-x-4">
          <Link to="/new" className="text-sm">Kirim</Link>
          <Link to="/admin" className="text-sm">Admin</Link>
          {user.username ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user.username}</span>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-sm text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Daftar</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/new" element={<PrivateRoute><NewMessage/></PrivateRoute>} />
          <Route path="/messages/:id" element={<MessageDetails/>} />
          <Route path="/list" element={<MessageList/>} />
          <Route path="/admin" element={<AdminPanel/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </main>
    </div>
  );
}
