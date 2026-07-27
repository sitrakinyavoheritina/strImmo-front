import { messageApi, type ApiConversation, type ApiContact, type ApiMessage } from './message-api';
import type { Contact, Conversation, Message } from '../types/message.types';

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

export function toContact(api: ApiContact): Contact {
  return {
    id: api.id,
    fullName: `${api.firstName} ${api.lastName}`.trim(),
    avatarUrl: api.avatarUrl ?? undefined,
    role: api.role,
    agencyName: api.agencyName,
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
  startConversation: (target: { propertyId: string } | { userId: string }) =>
    messageApi.startConversation(target).then(toConversation),
  searchContacts: (query: string) => messageApi.searchContacts(query).then((list) => list.map(toContact)),
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
