import { apiClient } from '@/lib/api/client';
import type { ApiProperty } from './property-api';
import type { ChatMessage } from '../types/chat.types';
import type { PropertyFilters } from '../types/listing.types';

export type ChatApiResponse = {
  reply: string;
  properties: ApiProperty[];
  // Derniers filtres structurés utilisés par l'outil de recherche côté serveur (absent si
  // l'assistant n'a appelé aucun outil) — mêmes noms de champs que `PropertyFilters`, voir
  // strImmo/src/chat/chat.service.ts.
  filters?: PropertyFilters;
};

// Le backend ne garde aucun état entre deux appels : on lui renvoie l'historique complet à chaque
// message, pas juste le dernier. Port direct de Onina-mobile/src/services/api/chat-api.ts.
export const chatApi = {
  sendMessage: (messages: ChatMessage[]) =>
    apiClient.post<ChatApiResponse>('/chat', { messages }).then((r) => r.data),
};
