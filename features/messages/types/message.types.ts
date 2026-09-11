// Port de Onina-mobile/src/features/messages/types/message.types.ts — mêmes champs, même
// contrat avec le backend (strImmo/src/messaging).

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatarUrl?: string;
  propertyId?: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  sentAt: string;
  readAt?: string | null;
};
