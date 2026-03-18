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

    socket.on('tokenUpdated', (data) => {
      console.log('Token updated:', data);
      dispatch(setQueueStatus(data));
    });

    socket.on('queueUpdate', (data) => {
      console.log('Queue updated:', data);
      dispatch(setQueueStatus(data));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  return { emit, socket: socketRef.current };
};
