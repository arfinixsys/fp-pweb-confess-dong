import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export default function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await API.get('/messages', {
        params: { page, pageSize }
      });
      
      console.log('📥 Messages loaded:', res.data.data); // ← debug log
      
      setMessages(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      console.error('Error loading messages:', err);
      alert('Gagal memuat pesan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [page]);

  const handleLike = async (id, currentLikes) => {
    try {
      await API.post(`/messages/${id}/like`);
      // Optimistic update
      setMessages(messages.map(m => 
        m.id === id ? { ...m, likes_count: currentLikes + 1 } : m
      ));
    } catch (err) {
      console.error('Error liking message:', err);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-slate-400 mt-4">Memuat pesan...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
        <p className="text-slate-400 text-lg">📭 Belum ada pesan.</p>
        <p className="text-slate-500 text-sm mt-2">Jadilah yang pertama untuk berbagi cerita!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="bg-dark-800 rounded-2xl p-6 border border-dark-700 hover:border-primary-500/50 transition shadow-lg hover:shadow-primary-500/10"
        >
          {/* Header: Sender Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {msg.is_anonymous ? '🕵️' : (msg.sender_name?.[0]?.toUpperCase() || 'A')}
              </div>
              
              {/* Sender Name & Recipient */}
              <div>
                <p className="text-white font-bold flex items-center gap-2">
                  {/* ✅ LOGIC FIX ANONYMOUS */}
                  {msg.is_anonymous ? (
                    <span className="text-slate-400">Anon</span>
                  ) : (
                    <span>{msg.sender_name || 'Anonymous'}</span>
                  )}
                  
                  {msg.is_anonymous && (
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                      Anonymous
                    </span>
                  )}
                </p>
                
                <p className="text-slate-400 text-sm">
                  To: <span className="text-accent font-semibold">{msg.recipient_name}</span>
                </p>
              </div>
            </div>

            {/* Date */}
            <span className="text-xs text-slate-500">
              {new Date(msg.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Message Content */}
          <p className="text-slate-300 mb-4 leading-relaxed">
            "{msg.message}"
          </p>

          {/* Image (if exists) */}
          {msg.image_path && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={msg.image_path}
                alt="Message attachment"
                className="w-full max-h-96 object-cover hover:scale-105 transition duration-300"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-700">
            <div className="flex items-center gap-4">
              {/* Like Button */}
              <button
                onClick={() => handleLike(msg.id, msg.likes_count || 0)}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition group"
              >
                <span className="text-xl group-hover:scale-125 transition">❤️</span>
                <span className="text-sm font-medium">{msg.likes_count || 0}</span>
              </button>

              {/* Comments Count (placeholder) */}
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xl">💬</span>
                <span className="text-sm">{msg.comments_count || 0}</span>
              </div>

              {/* Reports (admin only, hidden for now) */}
              {msg.reports_count > 0 && (
                <div className="flex items-center gap-2 text-yellow-500">
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm">{msg.reports_count}</span>
                </div>
              )}
            </div>

            {/* Detail Link */}
            <Link
              to={`/messages/${msg.id}`}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 group"
            >
              Detail
              <span className="group-hover:translate-x-1 transition">→</span>
            </Link>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-dark-800 text-white rounded-lg border border-dark-700 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          
          <span className="px-4 py-2 bg-dark-800 text-slate-300 rounded-lg border border-dark-700">
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 bg-dark-800 text-white rounded-lg border border-dark-700 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
