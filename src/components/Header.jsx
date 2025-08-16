'use client';

import React from 'react';
import api from '../lib/axios.js';
import useStore from '../store/useStore.js';
import { useRouter } from 'next/navigation';

export default function Header() {
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/auth/login');
    } catch (err) {
      alert('Logout failed');
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Collaborative Code Editor</h1>
      {user && (
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  );
}