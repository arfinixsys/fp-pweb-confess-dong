import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

export default function MessageDetail(){
  const { id } = useParams();
  const [msg, setMsg] = useState(null);
  
  useEffect(()=> {
    loadMessage();
  }, [id]);

  const loadMessage = () => {
    API.get(`/messages/${id}`).then(r=> setMsg(r.data.data)).catch(()=>{});
  };

  const handleLike = () => {
    API.post(`/messages/${id}/like`)
      .then(r=> {
        setMsg({...msg, likes_count: r.data.data.likes_count});
      })
      .catch(e=> console.error(e));
  };
  if (!msg) return <div>Loading...</div>;
  return (
    <div className="card max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold">Kepada: {msg.recipient_name}</h3>
      <div className="text-sm text-gray-500">Dari: {msg.sender_name}</div>
      <p className="mt-4">{msg.message}</p>
      {msg.image_path && <img src={msg.image_path.startsWith('http') ? msg.image_path : `${import.meta.env.VITE_API_BASE}${msg.image_path}`} alt="img" className="mt-4 max-h-96"/>}
      <div className="mt-4 flex gap-2">
        <button onClick={handleLike} className="px-3 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600">Like ({msg.likes_count})</button>
      </div>
    </div>
  );
}
