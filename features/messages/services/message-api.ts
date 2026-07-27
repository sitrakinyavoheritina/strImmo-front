import { apiClient } from '@/lib/api/client';

// Formes brutes renvoyées par strImmo (voir strImmo/src/messaging/messaging.service.ts et
// l'entité Message) — traduites vers les types "app" par message-service.ts.
export type ApiConversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatarUrl: string | null;
  propertyId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  imageUrl: string | null;
  createdAt: string;
  readAt: string | null;
};

// Forme minimale renvoyée par `GET /auth/search-contacts` (voir AuthService.searchContacts) —
// jamais le compte complet (téléphone/email non exposés), juste de quoi afficher un résultat de
// recherche et démarrer une conversation.
export type ApiContact = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: 'owner' | 'agent' | 'agency';
  agencyName?: string;
};

export const messageApi = {
  listConversations: () => apiClient.get<ApiConversation[]>('/conversations').then((r) => r.data),

  // `propertyId` (depuis une annonce) ou `userId` (depuis une recherche de contact, voir
  // searchContacts) — jamais les deux, MessagingController.start() exige l'un des deux.
  startConversation: (target: { propertyId: string } | { userId: string }) =>
    apiClient.post<ApiConversation>('/conversations/start', target).then((r) => r.data),

  searchContacts: (query: string) =>
    apiClient.get<ApiContact[]>('/auth/search-contacts', { params: { query } }).then((r) => r.data),

  getMessages: (conversationId: string) =>
    apiClient.get<ApiMessage[]>(`/conversations/${conversationId}/messages`).then((r) => r.data),

  // Un fichier binaire n'a pas sa place dans l'événement WebSocket "message:send" (JSON) — l'envoi
  // d'une photo passe par cette route REST dédiée, diffusée en temps réel côté serveur (voir
  // MessagingGateway.broadcastNewMessage).
  sendImage: (conversationId: string, formData: FormData) =>
    apiClient
      .post<ApiMessage>(`/conversations/${conversationId}/messages/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  // Repli REST quand la WebSocket n'est pas connectée — l'envoi d'un message texte lui-même passe
  // par la socket (voir use-messages.ts), pas par cette API.
  markRead: (conversationId: string) =>
    apiClient
      .patch<{ conversationId: string; otherUserId: string; readAt: string }>(
        `/conversations/${conversationId}/read`,
      )
      .then((r) => r.data),
};
