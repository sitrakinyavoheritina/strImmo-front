import { messageApi, type ApiConversation, type ApiMessage } from './message-api';
import type { Conversation, Message } from '../types/message.types';

// Exportées séparément (pas seulement via `messageService`) : réutilisées telles quelles par
// use-realtime-messages.ts pour traduire les payloads reçus en direct sur la WebSocket, qui ont
// exactement la même forme brute que les réponses REST.
export function toConversation(api: ApiConversation): Conversation {
  return {
    id: api.id,
    participantId: api.participantId,
    participantName: api.participantName,
    participantAvatarUrl: api.participantAvatarUrl ?? undefined,
    propertyId: api.propertyId ?? undefined,
    lastMessage: api.lastMessage,
    lastMessageAt: api.lastMessageAt,
    unreadCount: api.unreadCount,
  };
}

export function toMessage(api: ApiMessage): Message {
  return {
    id: api.id,
    conversationId: api.conversationId,
    senderId: api.senderId,
    text: api.text ?? undefined,
    imageUrl: api.imageUrl ?? undefined,
    sentAt: api.createdAt,
    readAt: api.readAt ?? undefined,
  };
}

export const messageService = {
  listConversations: () => messageApi.listConversations().then((list) => list.map(toConversation)),
  startConversation: (propertyId: string) => messageApi.startConversation(propertyId).then(toConversation),
  getMessages: (conversationId: string) =>
    messageApi.getMessages(conversationId).then((list) => list.map(toMessage)),
  markRead: (conversationId: string) => messageApi.markRead(conversationId),
  async sendImage(conversationId: string, file: File): Promise<Message> {
    const form = new FormData();
    form.append('image', file);
    const api = await messageApi.sendImage(conversationId, form);
    return toMessage(api);
  },
};
