import React from 'react';
import MessageList from './MessageList';
import { Link } from 'react-router-dom';

export default function Home(){ 
  const user = localStorage.getItem('user');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Kolom Kiri: Feed Pesan */}
      <div className="lg:col-span-3 order-2 lg:order-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🔥 Timeline Terpanas
          </h2>
          <span className="text-xs text-slate-500 bg-dark-800 px-3 py-1 rounded-full border border-dark-700 animate-pulse">Live Update</span>
        </div>
        <MessageList />
      </div>

      {/* Kolom Kanan: Banner & Info */}
      <aside className="lg:col-span-1 order-1 lg:order-2">
        <div className="sticky top-24 space-y-6">
          
          {/* Banner Ajak Confess */}
          <div className="bg-gradient-to-br from-primary-500 to-accent rounded-2xl p-6 text-center text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition duration-1000"></div>
            <h3 className="text-xl font-bold mb-2 relative z-10">Lagi Galau? 🥺</h3>
            <p className="text-white/90 text-sm mb-6 relative z-10">Tumpahkan saja di sini. Identitasmu aman kok!</p>
            <Link to="/new" className="block w-full bg-white text-primary-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition shadow-lg relative z-10">
              Mulai Confess 🚀
            </Link>
          </div>
          
          {/* Info Trending */}
          <div className="p-5 border border-dark-700 rounded-xl bg-dark-800/50 backdrop-blur-sm">
            <h4 className="font-semibold text-slate-300 mb-3 text-sm">Sedang Ramai</h4>
            <div className="flex flex-wrap gap-2">
              {['#KampusLife', '#Crush', '#SpillTheTea'].map(tag => (
                <span key={tag} className="text-xs bg-dark-900 text-slate-400 px-3 py-1 rounded-full border border-dark-700 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition">
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}