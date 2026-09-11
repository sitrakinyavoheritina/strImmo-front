import axios from 'axios';
import { useAuthStore } from '@/lib/state/use-auth-store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Accès au store Zustand hors composant React (`getState()`) : l'intercepteur tourne avant tout
// rendu, un hook classique n'est pas utilisable ici.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
