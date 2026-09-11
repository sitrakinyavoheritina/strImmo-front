'use client';

import { useParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useConversations } from '../hooks/use-messages';
import { ConversationItem } from './conversation-item';

/** Colonne de gauche du module messagerie (voir app/messages/layout.tsx) — toujours visible à
 * partir de `lg:`, remplacée par le fil ouvert en dessous de `lg:` (un seul panneau à la fois,
 * pas assez de largeur pour les deux côte à côte sur mobile). */
export function ConversationListPanel() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;
  const { data: conversations, isLoading } = useConversations();

  return (
    <div className="flex flex-col h-full">
      <h1 className="shrink-0 text-lg font-bold text-content-main px-4 py-3.5 border-b border-stroke-default">
        {t.messages.title}
      </h1>
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-stroke-default">
        {isLoading ? (
          <p className="text-sm text-content-muted px-4 py-4">{t.search.searching}</p>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} isActive={conversation.id === activeId} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <MessageCircle size={28} className="text-content-muted" />
            <p className="font-semibold text-sm text-content-main">{t.messages.emptyTitle}</p>
            <p className="text-xs text-content-muted">{t.messages.emptyDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
