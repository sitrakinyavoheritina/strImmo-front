// Aligné 1:1 sur strImmo/src/notifications/entities/notification.entity.ts — même contrat que
// mobile (Onina-mobile/src/features/notifications/types/notification.types.ts).
export type NotificationKind = 'listing_rejected' | 'listing_approved' | 'new_message' | 'other';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  // Présent seulement pour les notifications liées à une annonce précise (ex. refus/validation) —
  // sert à naviguer vers son détail au clic.
  propertyId?: string;
  // Présent uniquement pour `new_message` — sert à effacer d'un coup toutes les notifications
  // d'une conversation à son ouverture (voir use-mark-conversation-notifications-read.ts).
  conversationId?: string;
};
