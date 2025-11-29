import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function MessageList(){
  const [messages, setMessages] = useState([]);
  useEffect(()=> {
    API.get('/messages?page=1&pageSize=20')
      .then(r=> setMessages(r.data.data || []))
      .catch(e=> console.error(e));
  }, []);
  return (
    <div className="space-y-4">
      {messages.map(m => (
        <div key={m.id} className="card">
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-500">To: <b>{m.recipient_name}</b></div>
              <div className="text-xs text-gray-400">From: {m.sender_name}</div>
            </div>
            <div className="text-xs">{new Date(m.created_at).toLocaleString()}</div>
          </div>
          <p className="mt-2">{m.message}</p>
          {m.image_path && <img src={`http://localhost:4000${m.image_path}`} alt="img" className="mt-2 max-h-48 rounded"/>}
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 border rounded">Like ({m.likes_count})</button>
            <Link to={`/messages/${m.id}`} className="text-sm text-primary-500">Detail</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
