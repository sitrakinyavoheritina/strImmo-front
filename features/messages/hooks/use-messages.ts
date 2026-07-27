import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { messageService, toMessage } from '../services/message-service';
import type { ApiMessage } from '../services/message-api';
import { getSocket } from '@/lib/realtime/socket-client';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { notificationApi } from '@/features/notifications/services/notification-api';
import { notificationsQueryKey } from '@/features/notifications/hooks/use-notifications';
import type { AppNotification } from '@/features/notifications/types/notification.types';
import type { Conversation, Message } from '../types/message.types';

export const messagesQueryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversations', id, 'messages'] as const,
};

export function useConversations() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: messagesQueryKeys.conversations,
    queryFn: messageService.listConversations,
    enabled: isAuthenticated,
  });
}

// `enabled` sur la longueur de la requête (pas seulement sa présence) : évite d'interroger le
// backend à chaque frappe des 1 premiers caractères, avant que la recherche ait un sens (le
// backend refuse de toute façon en dessous de 2 caractères, voir AuthService.searchContacts).
export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ['contacts', 'search', query],
    queryFn: () => messageService.searchContacts(query),
    enabled: query.trim().length >= 2,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: messagesQueryKeys.conversation(id),
    queryFn: () => messageService.getMessages(id),
    enabled: Boolean(id),
  });
}

// Démarre (ou reprend, un seul fil par paire d'utilisateurs) la conversation avec le
// propriétaire/l'agence d'une annonce.
export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (target: { propertyId: string } | { userId: string }) =>
      messageService.startConversation(target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesQueryKeys.conversations });
    },
  });
}

// L'envoi lui-même passe par la WebSocket (pas par message-api.ts) : `socket.emit` avec un
// callback d'ack renvoie le message persisté par le serveur.
export function useSendMessage(conversationId: string) {
  return useMutation({
    mutationFn: (text: string) =>
      new Promise<ApiMessage>((resolve, reject) => {
        const socket = getSocket();
        if (!socket) {
          reject(new Error('Connexion temps réel indisponible. Réessayez.'));
          return;
        }

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Le serveur ne répond pas. Réessayez.'));
        }, 10000);

        function cleanup() {
          clearTimeout(timeout);
          socket?.off('exception', handleException);
        }
        // Une exception levée côté gateway (conversation introuvable...) n'invoque pas le callback
        // d'ack de socket.io — Nest l'envoie séparément via l'événement "exception".
        function handleException(err: { message?: string }) {
          cleanup();
          reject(new Error(err?.message ?? 'Envoi impossible.'));
        }

        socket.once('exception', handleException);
        socket.emit('message:send', { conversationId, text }, (ack: ApiMessage) => {
          cleanup();
          resolve(ack);
        });
      }).then(toMessage),
  });
}

// Upload REST (pas WS, un fichier binaire n'a pas sa place dans un événement JSON) — pas de mise
// à jour manuelle du cache ici : le serveur diffuse aussi ce message via la WebSocket à
// l'expéditeur lui-même (voir MessagingGateway.broadcastNewMessage), donc use-realtime-messages.ts
// s'en charge déjà, exactement comme pour un message texte envoyé par WS.
export function useSendImageMessage(conversationId: string) {
  return useMutation({
    mutationFn: (file: File) => messageService.sendImage(conversationId, file),
  });
}

// Total non-lu tous fils confondus — dérivé de la liste déjà chargée, pas d'endpoint dédié.
export function useUnreadMessagesCount(): number {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data } = useConversations();
  if (!isAuthenticated) return 0;
  return data?.reduce((sum, conversation) => sum + conversation.unreadCount, 0) ?? 0;
}

// Le message et sa notification ("Nouveau message" de la cloche) sont deux états "non lu"
// distincts côté backend, jamais synchronisés automatiquement — sans cet appel, la cloche restait
// non lue indéfiniment même quand l'utilisateur avait déjà le fil concerné ouvert sous les yeux.
// Pas de lien direct notification↔conversation en base : on marque donc toutes les notifications
// "nouveau message" en attente, ce qui reste correct puisqu'on vient justement d'ouvrir la
// messagerie et de lire un message reçu.
async function markMessageNotificationsAsRead(queryClient: QueryClient) {
  const notifications = queryClient.getQueryData<AppNotification[]>(notificationsQueryKey);
  const unread = notifications?.filter((notification) => notification.kind === 'new_message' && !notification.read);
  if (!unread || unread.length === 0) return;
  await Promise.all(unread.map((notification) => notificationApi.markAsRead(notification.id)));
  queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
}

// Marque le fil comme lu — au montage ET chaque fois qu'un nouveau message reçu (pas envoyé par
// nous) arrive pendant que le fil est déjà ouvert (dépendance sur `hasUnreadIncoming`, pas
// seulement `conversationId`) : sans ça, un message arrivé en temps réel pendant que la
// conversation est déjà affichée resterait marqué non-lu côté expéditeur jusqu'à rouvrir l'écran.
export function useMarkConversationRead(conversationId: string, messages: Message[] | undefined) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const hasUnreadIncoming =
    messages?.some((message) => message.senderId !== currentUserId && !message.readAt) ?? false;

  useEffect(() => {
    if (!conversationId || !hasUnreadIncoming) return;

    function markLocalAsRead() {
      const readAt = new Date().toISOString();
      queryClient.setQueryData<Message[]>(messagesQueryKeys.conversation(conversationId), (old) =>
        old
          ? old.map((message) =>
              message.senderId !== currentUserId && !message.readAt ? { ...message, readAt } : message,
            )
          : old,
      );
      queryClient.setQueryData<Conversation[]>(messagesQueryKeys.conversations, (old) =>
        old
          ? old.map((conversation) =>
              conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
            )
          : old,
      );
    }

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('message:read', { conversationId }, markLocalAsRead);
    } else {
      messageService.markRead(conversationId).then(markLocalAsRead).catch(() => {});
    }
    markMessageNotificationsAsRead(queryClient).catch(() => {});
  }, [conversationId, hasUnreadIncoming, currentUserId, queryClient]);
}
