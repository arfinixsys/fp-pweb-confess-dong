import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function MessageDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMessage = async () => {
    try {
      const res = await API.get(`/messages/${id}`);
      setMessage(res.data.data);
    } catch (err) {
      console.error('Error loading message:', err);
      alert('Pesan tidak ditemukan!');
      nav('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessage();
  }, [id]);

  const handleLike = async () => {
    try {
      await API.post(`/messages/${id}/like`);
      setMessage({ ...message, likes_count: (message.likes_count || 0) + 1 });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Alasan report (opsional):');
    if (reason === null) return;
    
    try {
      await API.post(`/messages/${id}/report`, { reason: reason || 'No reason' });
      alert('✅ Pesan berhasil dilaporkan!');
      setMessage({ ...message, reports_count: (message.reports_count || 0) + 1 });
    } catch (err) {
      alert('❌ Gagal melaporkan: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-slate-400 mt-4">Memuat pesan...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-slate-400">Pesan tidak ditemukan</p>
        <Link to="/" className="text-primary-400 mt-4 inline-block">← Kembali ke Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Back Button */}
      <Link 
        to="/" 
        className="text-primary-400 hover:text-primary-300 mb-6 inline-flex items-center gap-2"
      >
        ← Kembali
      </Link>

      {/* Message Card */}
      <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {message.is_anonymous ? '🕵️' : (message.sender_name?.[0]?.toUpperCase() || 'U')}
            </div>
            
            <div>
              <p className="text-white font-bold text-xl flex items-center gap-2">
                {message.is_anonymous ? (
                  <span className="text-slate-400">Anon</span>
                ) : (
                  <span>{message.sender_name || 'User'}</span>
                )}
                
                {message.is_anonymous && (
                  <span className="text-xs bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">
                    Anonymous
                  </span>
                )}
              </p>
              
              <p className="text-slate-400 text-sm mt-1">
                To: <span className="text-accent font-semibold text-base">{message.recipient_name}</span>
              </p>
              
              <p className="text-slate-500 text-xs mt-2">
                {new Date(message.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="mb-6">
          <p className="text-slate-200 text-lg leading-relaxed">
            "{message.message}"
          </p>
        </div>

        {/* Image */}
        {message.image_path && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img
              src={message.image_path}
              alt="Attachment"
              className="w-full max-h-[500px] object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-dark-700">
          <div className="flex items-center gap-6">
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex items-center gap-3 px-4 py-2 bg-dark-900 hover:bg-red-500/10 border border-dark-700 hover:border-red-500/50 rounded-lg text-slate-400 hover:text-red-400 transition group"
            >
              <span className="text-2xl group-hover:scale-125 transition">❤️</span>
              <span className="font-medium">{message.likes_count || 0} Likes</span>
            </button>

            {/* Report */}
            <button
              onClick={handleReport}
              className="flex items-center gap-3 px-4 py-2 bg-dark-900 hover:bg-yellow-500/10 border border-dark-700 hover:border-yellow-500/50 rounded-lg text-slate-400 hover:text-yellow-400 transition group"
            >
              <span className="text-2xl group-hover:scale-125 transition">⚠️</span>
              <span className="font-medium">Report</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>💬 0 comments</span>
            {message.reports_count > 0 && (
              <span className="text-yellow-500">⚠️ {message.reports_count} reports</span>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section (placeholder) */}
      <div className="mt-8 bg-dark-800 rounded-xl p-6 border border-dark-700">
        <h3 className="text-white font-bold mb-4">💬 Komentar</h3>
        <p className="text-slate-400 text-sm">Fitur komentar segera hadir...</p>
      </div>
    </div>
  );
}
  