'use client';

import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import api from '../lib/axios.js';

export default function useAuth() {
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [setUser]);

  return { user, loading };
}