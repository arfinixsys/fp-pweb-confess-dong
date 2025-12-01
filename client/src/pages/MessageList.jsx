import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function MessageList(){
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  // State untuk menyimpan ID pesan apa saja yang sudah di-like user ini
  const [likedIds, setLikedIds] = useState([]);

  useEffect(()=> {
    // 1. Ambil data pesan dari server
    fetchMessages();
    
    // 2. Cek LocalStorage: Pesan mana aja yang udah pernah di-like sama browser ini?
    const storedLikes = JSON.parse(localStorage.getItem('liked_messages') || '[]');
    setLikedIds(storedLikes);
  }, []);

  const fetchMessages = () => {
    API.get('/messages?page=1&pageSize=50')
      .then(r=> {
        setMessages(r.data.data || []);
        setLoading(false);
      })
      .catch(e=> {
        console.error(e);
        setLoading(false);
      });
  }

  // --- LOGIKA TOGGLE LIKE (BOLAK-BALIK) ---
  const handleToggleLike = async (id) => {
    // Cek apakah ID ini sudah ada di daftar likedIds
    const isLiked = likedIds.includes(id);
    
    try {
      if (isLiked) {
        // KASUS 1: SUDAH DI-LIKE -> LAKUKAN UNLIKE (BALIK KE SEMULA)
        await API.post(`/messages/${id}/unlike`);
        
        // Update Tampilan (Kurangi 1)
        setMessages(prev => prev.map(m => m.id === id ? { ...m, likes_count: Math.max(0, m.likes_count - 1) } : m));
        
        // Hapus dari daftar likedIds
        const newLikes = likedIds.filter(likedId => likedId !== id);
        setLikedIds(newLikes);
        localStorage.setItem('liked_messages', JSON.stringify(newLikes)); // Simpan ke browser

      } else {
        // KASUS 2: BELUM DI-LIKE -> LAKUKAN LIKE (+1)
        await API.post(`/messages/${id}/like`);
        
        // Update Tampilan (Tambah 1)
        setMessages(prev => prev.map(m => m.id === id ? { ...m, likes_count: (m.likes_count || 0) + 1 } : m));
        
        // Tambah ke daftar likedIds
        const newLikes = [...likedIds, id];
        setLikedIds(newLikes);
        localStorage.setItem('liked_messages', JSON.stringify(newLikes)); // Simpan ke browser
      }
    } catch (error) {
      console.error("Gagal toggle like:", error);
    }
  };

  if(loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="bg-dark-800 h-40 rounded-2xl animate-pulse"></div>)}</div>;

  return (
    <div className="space-y-6">
      {messages.map(m => {
        // Cek status like untuk tombol ini (biar warnanya beda)
        const isLiked = likedIds.includes(m.id);

        return (
          <div key={m.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition duration-300 shadow-lg group relative overflow-hidden">
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-700 to-dark-900 border border-dark-600 flex items-center justify-center text-lg font-bold text-slate-300">
                  {m.sender_name ? m.sender_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div className="text-sm text-slate-400 font-bold">{m.sender_name}</div>
                  <div className="text-xs text-slate-500">{new Date(m.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20 text-xs text-primary-400 font-medium">
                To: {m.recipient_name}
              </div>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed mb-4 font-light relative z-10">"{m.message}"</p>

            <div className="flex items-center justify-between pt-4 border-t border-dark-700 relative z-10">
              <div className="flex gap-4">
                {/* TOMBOL LIKE YANG PINTAR */}
                <button 
                  onClick={() => handleToggleLike(m.id)}
                  className={`flex items-center gap-2 transition active:scale-90 px-3 py-1 rounded-full ${
                    isLiked 
                      ? 'text-pink-500 bg-pink-500/10 font-bold'  // Kalau sudah like: Warna Pink Menyala
                      : 'text-slate-400 hover:text-pink-500'       // Kalau belum: Abu-abu
                  }`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span> 
                  <span className="text-sm">{m.likes_count || 0}</span>
                </button>
              </div>
              <Link to={`/messages/${m.id}`} className="text-sm text-accent hover:text-white transition">Detail &rarr;</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}