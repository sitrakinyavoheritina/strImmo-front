import axios from 'axios';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { disconnectSocket } from '@/lib/realtime/socket-client';

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

// Un token expiré/invalide n'était auparavant jamais purgé : chaque requête continuait de
// l'envoyer, échouait en 401, et React Query la retentait (retry par défaut ×3) à chaque montage,
// focus d'onglet, reconnexion ou événement temps réel — jusqu'à ce que l'utilisateur se déconnecte
// puis rafraîchisse manuellement. On coupe court ici dès le premier 401 : session locale effacée,
// socket temps réel fermée, redirection vers la connexion — ne se déclenche que si une session
// existait (sinon un simple visiteur non connecté serait renvoyé vers /connexion à tort).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().clearSession();
      disconnectSocket();
      if (typeof window !== 'undefined' && window.location.pathname !== '/connexion') {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);
