import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { toMessage } from '../services/message-service';
import type { ApiMessage } from '../services/message-api';
import { connectSocket, disconnectSocket } from '@/lib/realtime/socket-client';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { notificationsQueryKey } from '@/features/notifications/hooks/use-notifications';
import { messagesQueryKeys } from './use-messages';
import type { Message } from '../types/message.types';

type ReadEvent = { conversationId: string; readAt: string };

// Monté une seule fois à la racine (voir components/layout/realtime-provider.tsx) — met à jour le
// cache React Query pour toute la feature messages (liste de conversations + fil ouvert), quelle
// que soit la page affichée à l'instant où l'événement arrive.
export function useRealtimeMessages() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket: Socket | null = connectSocket();
    if (!socket) return;

    function handleNewMessage(raw: ApiMessage) {
      const message = toMessage(raw);
      queryClient.setQueryData<Message[]>(messagesQueryKeys.conversation(message.conversationId), (old) =>
        old ? [...old, message] : old,
      );
      queryClient.invalidateQueries({ queryKey: messagesQueryKeys.conversations });
      // Le backend crée aussi une notification "nouveau message" pour le destinataire (voir
      // messaging.service.ts) — sans cette invalidation, la cloche restait figée sur son dernier
      // compte tant qu'aucune navigation ne redéclenchait la requête, même quand une vraie
      // notification non lue venait d'apparaître en base.
      const currentUserId = useAuthStore.getState().user?.id;
      if (message.senderId !== currentUserId) {
        queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      }
    }

    // Émis vers l'expéditeur quand l'autre participant ouvre le fil — ne marque comme lus que ses
    // propres messages (`senderId === currentUserId`), pas ceux reçus de l'autre participant.
    function handleRead({ conversationId, readAt }: ReadEvent) {
      const currentUserId = useAuthStore.getState().user?.id;
      queryClient.setQueryData<Message[]>(messagesQueryKeys.conversation(conversationId), (old) =>
        old
          ? old.map((message) =>
              message.senderId === currentUserId && !message.readAt ? { ...message, readAt } : message,
            )
          : old,
      );
    }

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleRead);
    };
  }, [queryClient, isAuthenticated]);
}
