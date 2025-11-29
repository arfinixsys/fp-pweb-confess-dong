import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

export default function MessageDetail(){
  const { id } = useParams();
  const [msg, setMsg] = useState(null);
  useEffect(()=> {
    API.get(`/messages/${id}`).then(r=> setMsg(r.data.data)).catch(()=>{});
  }, [id]);
  if (!msg) return <div>Loading...</div>;
  return (
    <div className="card max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold">Kepada: {msg.recipient_name}</h3>
      <div className="text-sm text-gray-500">Dari: {msg.sender_name}</div>
      <p className="mt-4">{msg.message}</p>
      {msg.image_path && <img src={`http://localhost:4000${msg.image_path}`} alt="img" className="mt-4 max-h-96"/>}
    </div>
  );
}
