import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NewMessage from './pages/NewMessage';
import MessageDetails from './pages/MessageDetails';
import AdminPanel from './pages/AdminPanel';
import MessageList from './pages/MessageList';

export default function App(){
  return (
    <div>
      <header className="p-4 flex justify-between items-center border-b">
        <Link to="/" className="text-xl font-bold text-primary-500">Confess Dong</Link>
        <nav className="space-x-4">
          <Link to="/new" className="text-sm">Kirim</Link>
          <Link to="/admin" className="text-sm">Admin</Link>
        </nav>
      </header>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/new" element={<NewMessage/>} />
          <Route path="/messages/:id" element={<MessageDetails/>} />
          <Route path="/list" element={<MessageList/>} />
          <Route path="/admin" element={<AdminPanel/>} />
        </Routes>
      </main>
    </div>
  );
}
