import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { notificationApi } from '../services/notification-api';

export const notificationsQueryKey = ['notifications'] as const;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: notificationApi.list,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });
}

// Dérivé de la liste déjà chargée, pas d'endpoint dédié — même principe que
// useUnreadMessagesCount (features/messages/hooks/use-messages.ts).
export function useUnreadNotificationsCount(): number {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data } = useNotifications();
  if (!isAuthenticated) return 0;
  return data?.filter((notification) => !notification.read).length ?? 0;
}

// Appelé depuis app/messages/[id]/page.tsx à l'ouverture d'un fil — efface les notifications
// "nouveau message" de cette conversation précise (le badge de la cloche se met à jour tout de
// suite, pas seulement au prochain rechargement de la page). Même principe que
// useMarkConversationRead (features/messages/hooks/use-messages.ts) pour les messages eux-mêmes,
// séparé ici : ce sont deux ressources distinctes côté serveur (messages vs notifications).
export function useMarkConversationNotificationsRead(conversationId: string) {
  const queryClient = useQueryClient();
  const { data: notifications } = useNotifications();
  const hasUnread = notifications?.some((n) => n.conversationId === conversationId && !n.read) ?? false;

  useEffect(() => {
    if (!conversationId || !hasUnread) return;
    notificationApi.markConversationAsRead(conversationId).then(() => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    });
  }, [conversationId, hasUnread, queryClient]);
}
