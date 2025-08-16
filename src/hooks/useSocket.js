'use client';
import { useEffect } from 'react';
import { initSocket, getSocket } from '../lib/socket.js';

export default function useSocket(roomId) {
  useEffect(() => {
    const socket = initSocket();

    socket.on("connect", () => console.log("✅ Connected:", socket.id));

    if (roomId) {
      socket.emit('collab:join', { roomId });
    }

    return () => {
      if (roomId) {
        socket.emit('collab:leave', { roomId });
      }
      socket.disconnect();
    };
  }, [roomId]);
}
