import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminPanel() {
  const [msgs, setMsgs] = useState([]);
  
  // =======================================================
  // KITA TULIS MANUAL (HARDCODE) BIAR 100% WORK
  // =======================================================
  // Samakan persis dengan yang di .env server tadi
const ADMIN_TOKEN = "rahasia123";

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    API.get('/admin/messages', { headers: { 'x-admin-token': ADMIN_TOKEN } })
      .then(r => setMsgs(r.data.data))
      .catch(function (err) { 
        console.error(err);
        alert('Gagal Masuk: Pastikan Terminal Server (Backend) sudah direstart setelah ganti .env!'); 
      });
  };

  const handleApprove = (id) => {
    if (confirm('Approve message ini?')) {
      API.patch(`/messages/${id}/approve`, { is_approved: 1 }, { headers: { 'x-admin-token': ADMIN_TOKEN } })
        .then(() => {
          alert('Message approved ✅');
          loadMessages();
        })
        .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleSoftDelete = (id) => {
    if (confirm('Soft delete message ini?')) {
      API.delete(`/messages/${id}/soft`, { headers: { 'x-admin-token': ADMIN_TOKEN } })
        .then(() => {
          alert('Message soft deleted 🗑️');
          loadMessages();
        })
        .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleHardDelete = (id) => {
    if (confirm('Hapus PERMANEN dari database?')) {
      API.delete(`/messages/${id}`, { headers: { 'x-admin-token': ADMIN_TOKEN } })
        .then(() => {
          alert('Message permanently deleted 💀');
          loadMessages();
        })
        .catch(err => alert('Error: ' + err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
             🛡️ Admin Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Status Token: <span className="text-green-400 font-mono text-xs bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30">TERHUBUNG</span>
          </p>
        </div>
        <button 
          onClick={loadMessages} 
          className="mt-4 md:mt-0 bg-dark-700 hover:bg-dark-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition border border-dark-600 shadow-lg flex items-center gap-2"
        >
          <span>🔄</span> Refresh Data
        </button>
      </div>

      {/* Grid Kartu Pesan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {msgs.length === 0 ? (
           <div className="col-span-3 text-center py-20 bg-dark-800/30 rounded-3xl border border-dashed border-dark-700">
             <p className="text-slate-500 text-lg">Tidak ada pesan yang perlu dimoderasi.</p>
           </div>
        ) : (
           msgs.map(m => (
            <div key={m.id} className="bg-dark-800 border border-dark-700 p-6 rounded-2xl shadow-xl flex flex-col hover:border-primary-500/30 transition duration-300 relative group">
              
              {/* Metadata */}
              <div className="flex justify-between items-start mb-4 border-b border-dark-700 pb-3">
                <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">From</div>
                    <div className="text-primary-400 font-bold truncate max-w-[120px]">{m.sender_name}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">To</div>
                    <div className="text-slate-200 font-medium truncate max-w-[120px]">{m.recipient_name}</div>
                </div>
              </div>
              
              {/* Isi Pesan */}
              <div className="flex-grow">
                 <p className="text-slate-300 italic text-sm leading-relaxed mb-4 bg-dark-900/50 p-3 rounded-lg border border-dark-700/50 min-h-[80px]">
                   "{m.message}"
                 </p>
                 <div className="text-xs text-slate-600 mb-4 text-right">
                   {new Date(m.created_at).toLocaleString()}
                 </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-dark-700">
                <button 
                  onClick={() => handleApprove(m.id)} 
                  className="bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white py-2 rounded-lg text-xs font-bold transition border border-green-500/20 flex flex-col items-center justify-center gap-1"
                >
                  <span>✅</span> Approve
                </button>
                <button 
                  onClick={() => handleSoftDelete(m.id)} 
                  className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-600 hover:text-white py-2 rounded-lg text-xs font-bold transition border border-yellow-500/20 flex flex-col items-center justify-center gap-1"
                >
                  <span>🗑️</span> Soft Del
                </button>
                <button 
                  onClick={() => handleHardDelete(m.id)} 
                  className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white py-2 rounded-lg text-xs font-bold transition border border-red-500/20 flex flex-col items-center justify-center gap-1"
                >
                  <span>💀</span> Hard Del
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}