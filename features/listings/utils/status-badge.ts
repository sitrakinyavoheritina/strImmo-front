import type { Translations } from '@/lib/i18n/translations';

// Partagé entre MyPropertyCard ("Mes Biens") et AdminPropertyListItem ("/admin/annonces") — même
// vocabulaire visuel pour le statut d'une annonce partout dans l'app.
export const STATUS_LABEL_KEY = {
  pending: 'statusPending',
  approved: 'statusApproved',
  rejected: 'statusRejected',
} as const satisfies Record<'pending' | 'approved' | 'rejected', keyof Translations['myPropertiesPage']>;

export const STATUS_BADGE_CLASS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-danger/10 text-danger',
} as const;
