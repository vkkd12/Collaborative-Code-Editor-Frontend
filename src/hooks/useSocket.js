'use client';

import { useEffect } from 'react';
import { initSocket } from '../lib/socket.js';

export default function useSocket(roomId) {
  useEffect(() => {
    const socket = initSocket();

    if (roomId) {
      socket.emit('collab:join', { roomId });
    }

    return () => {
      if (roomId) {
        socket.emit('collab:leave', { roomId });
      }
    };
  }, [roomId]);
}