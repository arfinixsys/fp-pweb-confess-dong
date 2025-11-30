import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function MessageList(){
  const [messages, setMessages] = useState([]);
  
  useEffect(()=> {
    loadMessages();
  }, []);

  const loadMessages = () => {
    API.get('/messages?page=1&pageSize=20')
      .then(r=> setMessages(r.data.data || []))
      .catch(e=> console.error(e));
  };

  const handleLike = (id, index) => {
    API.post(`/messages/${id}/like`)
      .then(r=> {
        const updated = [...messages];
        updated[index].likes_count = r.data.data.likes_count;
        setMessages(updated);
      })
      .catch(e=> console.error(e));
  };
  return (
    <div className="space-y-4">
      {messages.map((m, idx) => (
        <div key={m.id} className="card">
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-500">To: <b>{m.recipient_name}</b></div>
              <div className="text-xs text-gray-400">From: {m.sender_name}</div>
            </div>
            <div className="text-xs">{new Date(m.created_at).toLocaleString()}</div>
          </div>
          <p className="mt-2">{m.message}</p>
          {m.image_path && <img src={m.image_path.startsWith('http') ? m.image_path : `${import.meta.env.VITE_API_BASE}${m.image_path}`} alt="img" className="mt-2 max-h-48 rounded"/>}
          <div className="mt-2 flex gap-2">
            <button onClick={() => handleLike(m.id, idx)} className="px-3 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600">Like ({m.likes_count})</button>
            <Link to={`/messages/${m.id}`} className="text-sm text-primary-500">Detail</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
