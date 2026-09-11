import { apiClient } from '@/lib/api/client';
import type { ApiProperty } from './property-api';
import type { ChatMessage } from '../types/chat.types';

export type ChatApiResponse = {
  reply: string;
  properties: ApiProperty[];
};

// Le backend ne garde aucun état entre deux appels : on lui renvoie l'historique complet à chaque
// message, pas juste le dernier. Port direct de Onina-mobile/src/services/api/chat-api.ts.
export const chatApi = {
  sendMessage: (messages: ChatMessage[]) =>
    apiClient.post<ChatApiResponse>('/chat', { messages }).then((r) => r.data),
};
