'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios.js';
import useStore from '../../../store/useStore.js';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useStore((state) => state.setUser);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res1 = await api.post('/auth/register', { username, email, password });
      if (res1.data.success) {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
          setUser(res.data.data.user);
          if (res.data.data.accessToken) {
            localStorage.setItem('accessToken', res.data.data.accessToken);
          }
          if (res.data.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.data.refreshToken);
          }
          localStorage.removeItem('joinedProjects');
          router.push('/');
        } else {
          setError(res.data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <button
          type="button"
          className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={() => router.push('/auth/login')}
        >
          Go to Login
        </button>
      </form>
    </div>
  );
}