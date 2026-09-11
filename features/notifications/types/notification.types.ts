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
};
