// Port de Onina-mobile/src/features/messages/types/message.types.ts — mêmes champs, même
// contrat avec le backend (strImmo/src/messaging).

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatarUrl?: string;
  propertyId?: string;
  // Rempli uniquement quand la conversation a été démarrée depuis une demande (bouton message de
  // PublicBoardCard) — jamais en même temps que `propertyId`. Permet d'afficher un encart
  // "Demande de recherche" en haut du fil (voir app/messages/[id]/page.tsx), via
  // GET /property-requests/:id/summary (route publique, pas celle réservée à l'auteur).
  requestId?: string;
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

// Résultat de recherche pour démarrer une nouvelle conversation (voir use-search-contacts.ts) —
// restreint aux comptes propriétaire/agent/agence, jamais locataire (choix explicite).
export type Contact = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: 'owner' | 'agent' | 'agency';
  agencyName?: string;
};
