'use client';

import { useRealtimeMessages } from '@/features/messages/hooks/use-realtime-messages';

/** Monte la connexion WebSocket de messagerie une seule fois, pour toute l'app — ne rend rien. */
export function RealtimeProvider() {
  useRealtimeMessages();
  return null;
}
