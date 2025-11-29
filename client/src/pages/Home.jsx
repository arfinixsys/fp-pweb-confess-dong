import React from 'react';
import MessageList from './MessageList';
export default function Home(){ return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2">
      <MessageList />
    </div>
    <aside>
      <div className="card">
        <h3 className="font-semibold mb-2">Kirim Confess</h3>
        <a className="btn-primary block text-center" href="/new">Buat Pesan</a>
      </div>
    </aside>
  </div>
);}
