'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useSearchContacts, useStartConversation } from '../hooks/use-messages';

const ROLE_LABEL_KEY = {
  owner: 'roleOwner',
  agent: 'roleAgent',
  agency: 'roleAgency',
} as const;

/** Recherche d'un propriétaire/intermédiaire/agence pour démarrer une conversation qui n'existe
 * pas encore (voir AuthService.searchContacts, restreint à ces trois rôles — jamais locataire,
 * choix explicite) — même overlay que DeleteConfirmModal (app/annonce/[id]/page.tsx) : fond
 * assombri/flouté, clic dehors = annule. */
export function NewConversationModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: contacts, isFetching } = useSearchContacts(debouncedQuery);
  const { mutate: startConversation, isPending, error } = useStartConversation();

  function handlePick(userId: string) {
    startConversation(
      { userId },
      {
        onSuccess: (conversation) => {
          router.push(`/messages/${conversation.id}`);
          onClose();
        },
      }
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface-card rounded-2xl shadow-lg p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-bold text-content-main">{t.messages.newConversation}</p>

        <div className="mt-3 flex items-center gap-2 rounded-full border border-stroke-default bg-surface-app px-3.5 py-2.5">
          <Search size={16} className="text-content-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.messages.newConversationSearchPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-sm text-content-main placeholder-content-muted outline-none"
          />
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto -mx-1 px-1">
          {debouncedQuery.trim().length < 2 ? (
            <p className="text-[0.85rem] text-content-muted text-center py-4">{t.messages.newConversationHint}</p>
          ) : isFetching ? (
            <p className="text-[0.85rem] text-content-muted text-center py-4">{t.search.searching}</p>
          ) : contacts && contacts.length > 0 ? (
            <div className="divide-y divide-stroke-default">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handlePick(contact.id)}
                  className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-surface-app rounded-lg px-1.5 transition disabled:opacity-60"
                >
                  <Avatar name={contact.fullName} imageUrl={contact.avatarUrl} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-content-main truncate">
                      {contact.agencyName ?? contact.fullName}
                    </p>
                    <p className="text-[0.85rem] text-content-muted">{t.auth[ROLE_LABEL_KEY[contact.role]]}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[0.85rem] text-content-muted text-center py-4">{t.messages.newConversationEmpty}</p>
          )}
        </div>

        {error && <p className="mt-2 text-[0.85rem] text-danger">{t.messages.newConversationError}</p>}
      </div>
    </div>
  );
}
