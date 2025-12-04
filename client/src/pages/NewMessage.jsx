import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function NewMessage() {
  const [form, setForm] = useState({
    recipient_name: '',
    message: '',
    is_anonymous: false,  // ← default tidak anonymous
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('📤 Sending data:', form); // ← debug log
      
      await API.post('/messages', {
        recipient_name: form.recipient_name,
        message: form.message,
        is_anonymous: form.is_anonymous,  // ← kirim boolean
        image_url: form.image_url || null
      });
      
      alert('✅ Pesan berhasil dikirim!');
      nav('/');
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl text-white font-bold mb-6">Buat Pesan Baru</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Name */}
        <div>
          <label className="text-slate-300 block mb-2">Untuk Siapa?</label>
          <input
            type="text"
            required
            placeholder="Nama penerima (misal: Dina)"
            className="w-full px-4 py-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
            value={form.recipient_name}
            onChange={(e) => setForm({...form, recipient_name: e.target.value})}
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-slate-300 block mb-2">Pesan</label>
          <textarea
            required
            rows={5}
            placeholder="Tulis pesan kamu di sini..."
            className="w-full px-4 py-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
          />
        </div>

        {/* Image URL (optional) */}
        <div>
          <label className="text-slate-300 block mb-2">URL Gambar (opsional)</label>
          <input
            type="url"
            placeholder="https://i.imgur.com/example.jpg"
            className="w-full px-4 py-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
            value={form.image_url}
            onChange={(e) => setForm({...form, image_url: e.target.value})}
          />
        </div>

        {/* Anonymous Checkbox */}
        <div className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg border border-dark-700">
          <input
            type="checkbox"
            id="anonymous"
            className="w-5 h-5 accent-primary-500 cursor-pointer"
            checked={form.is_anonymous}
            onChange={(e) => setForm({...form, is_anonymous: e.target.checked})}
          />
          <label htmlFor="anonymous" className="text-slate-300 cursor-pointer select-none">
            🕵️ Kirim sebagai <strong className="text-primary-400">Anonymous</strong> (nama pengirim disembunyikan)
          </label>
        </div>

        {/* Preview */}
        <div className="p-4 bg-dark-800/50 rounded-lg border border-primary-500/30">
          <p className="text-xs text-slate-400 mb-2">Preview:</p>
          <p className="text-white">
            <span className="text-primary-400">
              {form.is_anonymous ? 'Anon' : 'Username Kamu'}
            </span>
            {' → '}
            <span className="text-accent">
              {form.recipient_name || '(penerima)'}
            </span>
          </p>
          <p className="text-slate-300 mt-2 italic">
            "{form.message || '(pesan kamu)'}"
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent hover:from-primary-600 hover:to-accent text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Mengirim...' : '📨 Kirim Pesan'}
        </button>
      </form>
    </div>
  );
}
