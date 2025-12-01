import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

export default function MessageDetail(){
  const { id } = useParams(); // Ambil ID dari URL
  const [msg, setMsg] = useState(null);
  const [isLiked, setIsLiked] = useState(false); // Status apakah user ini sudah like?

  useEffect(()=> {
    // 1. Ambil Data Pesan dari Server
    API.get(`/messages/${id}`).then(r=> setMsg(r.data.data)).catch(()=>{});

    // 2. Cek LocalStorage (Apakah user pernah like pesan ini?)
    // Kita convert ID ke integer/string biar aman saat mencocokkan
    const storedLikes = JSON.parse(localStorage.getItem('liked_messages') || '[]');
    // Cek apakah ID pesan ini (id) ada di dalam array storedLikes
    // PENTING: id dari useParams itu string, storedLikes biasanya number/string. Kita samakan jadi string.
    const alreadyLiked = storedLikes.some(likedId => String(likedId) === String(id));
    
    setIsLiked(alreadyLiked);
  }, [id]);

  // --- FUNGSI TOGGLE LIKE PINTAR ---
  const handleToggleLike = async () => {
    // Ambil daftar like lama
    let storedLikes = JSON.parse(localStorage.getItem('liked_messages') || '[]');
    
    try {
      if (isLiked) {
        // KASUS: SUDAH LIKE -> MAU UNLIKE
        await API.post(`/messages/${id}/unlike`);
        
        // Update UI (Kurangi 1)
        setMsg(prev => ({ ...prev, likes_count: Math.max(0, prev.likes_count - 1) }));
        
        // Update LocalStorage (Hapus ID ini)
        storedLikes = storedLikes.filter(likedId => String(likedId) !== String(id));
        
        setIsLiked(false); // Ubah status tombol
      } else {
        // KASUS: BELUM LIKE -> MAU LIKE
        await API.post(`/messages/${id}/like`);
        
        // Update UI (Tambah 1)
        setMsg(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + 1 }));
        
        // Update LocalStorage (Tambah ID ini)
        storedLikes.push(id);
        
        setIsLiked(true); // Ubah status tombol
      }
      
      // Simpan perubahan ke browser
      localStorage.setItem('liked_messages', JSON.stringify(storedLikes));

    } catch (error) {
      console.error(error);
      alert("Gagal memproses like");
    }
  };

  if (!msg) return <div className="text-center text-slate-500 mt-20">Loading data...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Link to="/" className="text-slate-400 hover:text-white mb-4 inline-block">&larr; Kembali ke Timeline</Link>
      
      <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Hiasan Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {msg.sender_name ? msg.sender_name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Kepada: {msg.recipient_name}</h1>
            <p className="text-slate-400">Dari: <span className="text-primary-400 font-bold">{msg.sender_name}</span></p>
          </div>
        </div>

        <div className="bg-dark-900/50 p-6 rounded-2xl border border-dark-700 mb-6 relative z-10">
          <p className="text-2xl text-slate-200 leading-relaxed font-light italic">"{msg.message}"</p>
        </div>

        {msg.image_path && (
          <img src={`http://localhost:4000${msg.image_path}`} className="w-full rounded-2xl border border-dark-700 mb-6 shadow-md relative z-10" alt="evidence" />
        )}

        <div className="flex gap-4 border-t border-dark-700 pt-6 relative z-10">
          {/* TOMBOL LIKE YANG SUDAH DIPERBAIKI */}
          <button 
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition shadow-lg active:scale-95 ${
              isLiked 
                ? 'bg-pink-600 text-white shadow-pink-500/30 hover:bg-pink-700' // Style kalau sudah like
                : 'bg-dark-700 text-slate-300 hover:bg-dark-600 hover:text-white' // Style kalau belum like
            }`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span> 
            <span className="font-bold">Like ({msg.likes_count || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );
}