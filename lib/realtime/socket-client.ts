import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/state/use-auth-store';

// Instance unique partagée par toute l'app, même principe que
// Onina-mobile/src/services/realtime/socket-client.ts — le token est lu directement dans le store
// (synchrone côté web, pas besoin d'un accès asynchrone comme SecureStore côté mobile).
let socket: Socket | null = null;

export function connectSocket(): Socket | null {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  const token = useAuthStore.getState().token;
  if (!token) return null;

  socket = io(process.env.NEXT_PUBLIC_API_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
