'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, MessageCirclePlus, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useConversations } from '../hooks/use-messages';
import { ConversationItem } from './conversation-item';
import { NewConversationModal } from './new-conversation-modal';

// Normalisation légère (minuscule + accents retirés) : évite qu'une recherche "agence" ne rate
// "Agence" à cause de la casse, ou "eugene" ne rate "Eugène" à cause de l'accent.
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Colonne de gauche du module messagerie (voir app/messages/layout.tsx) — toujours visible à
 * partir de `lg:`, remplacée par le fil ouvert en dessous de `lg:` (un seul panneau à la fois,
 * pas assez de largeur pour les deux côte à côte sur mobile). Recherche filtrant la liste déjà
 * chargée côté client (pas de requête réseau, toutes les conversations sont déjà en mémoire) —
 * demandé explicitement pour retrouver une discussion sans avoir à tout faire défiler. Le bouton
 * "+" ouvre une recherche distincte, côté serveur celle-là (voir NewConversationModal), pour
 * démarrer une conversation avec quelqu'un qui n'apparaît pas encore dans cette liste. */
export function ConversationListPanel() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;
  const { data: conversations, isLoading } = useConversations();
  const [query, setQuery] = useState('');
  const [isPickingContact, setIsPickingContact] = useState(false);

  const filtered = useMemo(() => {
    const trimmed = normalize(query.trim());
    if (!trimmed) return conversations;
    return conversations?.filter((conversation) => normalize(conversation.participantName).includes(trimmed));
  }, [conversations, query]);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3.5 border-b border-stroke-default">
        <h1 className="text-lg font-bold text-brand-secondary-text">{t.messages.title}</h1>
        <button
          type="button"
          onClick={() => setIsPickingContact(true)}
          aria-label={t.messages.newConversation}
          title={t.messages.newConversation}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-brand-primary hover:bg-brand-primary-soft transition"
        >
          <MessageCirclePlus size={20} />
        </button>
      </div>

      {conversations && conversations.length > 0 && (
        <div className="shrink-0 flex items-center gap-2 mx-3 mt-3 rounded-full border border-stroke-default bg-surface-app px-3.5 py-2">
          <Search size={15} className="text-content-muted shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.messages.searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-sm text-content-main placeholder-content-muted outline-none"
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-stroke-default mt-1">
        {isLoading ? (
          <p className="text-sm text-content-muted px-4 py-4">{t.search.searching}</p>
        ) : filtered && filtered.length > 0 ? (
          filtered.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} isActive={conversation.id === activeId} />
          ))
        ) : conversations && conversations.length > 0 ? (
          <p className="text-sm text-content-muted px-4 py-4 text-center">{t.messages.noConversationMatch}</p>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <MessageCircle size={28} className="text-content-muted" />
            <p className="font-semibold text-sm text-content-main">{t.messages.emptyTitle}</p>
            <p className="text-[0.85rem] text-content-muted">{t.messages.emptyDescription}</p>
          </div>
        )}
      </div>

      {isPickingContact && <NewConversationModal onClose={() => setIsPickingContact(false)} />}
    </div>
  );
}
