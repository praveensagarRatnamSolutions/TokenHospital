import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(hospitalId: string) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      query: { hospitalId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Token WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Token WebSocket');
    });
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
