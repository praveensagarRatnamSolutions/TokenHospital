'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '../store/hooks';
import { setQueueStatus } from '../store/slices/tokenSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('queue-updated', (data) => {
      console.log('Real-time Queue Update:', data);
      dispatch(setQueueStatus(data));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const joinHospital = (hospitalId: string) => {
    socketRef.current?.emit('join-hospital', hospitalId);
  };

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  return { emit, joinHospital, socket: socketRef.current };
};
