'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Send, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { trackEvent } from '@/lib/analytics/track';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { filtersToSearchParams } from '../utils/filters-query';
import { useChatAssistant } from '../hooks/use-chat-assistant';
import { SearchResultCard } from './search-result-card';
import type { ChatMessage } from '../types/chat.types';
import type { Property, PropertyFilters } from '../types/listing.types';

// Au-delà de ce nombre, le panneau inline (sous le chat, largeur réduite) n'affiche plus qu'un
// aperçu — le reste se consulte sur /recherche, comme une recherche classique (demandé
// explicitement : "afficher un texte voir les résultats de recherche et redirect").
const INLINE_RESULTS_LIMIT = 4;

/**
 * Panneau de recherche IA inline (onglet de la section recherche de l'accueil) — pas de page
 * dédiée contrairement au mobile, tout se passe ici. Historique complet renvoyé à chaque appel
 * (backend sans état, voir strImmo/src/chat/chat.service.ts).
 */
export function AiSearchPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [lastProperties, setLastProperties] = useState<Property[]>([]);
  const [lastFilters, setLastFilters] = useState<PropertyFilters | undefined>();
  const { mutate, isPending } = useChatAssistant();

  // Navigue vers la page de recherche classique avec les filtres structurés utilisés par
  // l'assistant, plutôt que de repasser la liste déjà résolue par un store en mémoire — l'URL
  // obtenue est donc partageable et survit à un rechargement, comme n'importe quelle recherche
  // manuelle (voir app/recherche/page.tsx, qui n'a plus besoin de connaître de mode "IA" à part).
  function handleViewAllResults() {
    if (!lastFilters) return;
    router.push(`/recherche?${filtersToSearchParams(lastFilters).toString()}`);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    const nextHistory: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setInput('');

    trackEvent('send_message', { source: 'ai_search' });
    mutate(nextHistory, {
      onSuccess: (response) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
        setLastProperties(response.properties);
        setLastFilters(response.filters);
      },
      onError: (error) => {
        // Le 429 du throttler renvoie un message technique en anglais ("ThrottlerException: Too
        // Many Requests") — on l'écrase volontairement plutôt que de le relayer tel quel, contrairement
        // aux autres erreurs (voir getErrorMessage) qui viennent déjà en français directement affichable.
        const content =
          axios.isAxiosError(error) && error.response?.status === 429
            ? t.chat.rateLimitMessage
            : getErrorMessage(error, t.chat.errorMessage);
        setMessages((prev) => [...prev, { role: 'assistant', content }]);
      },
    });
  }

  return (
    <div className="space-y-3">
      <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
        {messages.length === 0 && (
          <div className="flex items-start gap-2 bg-surface-app rounded-xl p-3 text-sm text-content-main">
            <Sparkles size={16} className="text-brand-primary shrink-0 mt-0.5" />
            {t.chat.welcomeMessage}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              message.role === 'user'
                ? 'ml-auto bg-brand-primary text-white'
                : 'bg-surface-app text-content-main'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isPending && <p className="text-[0.85rem] text-content-muted">{t.chat.typing}</p>}
      </div>

      {lastProperties.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-content-main mb-2">{t.chat.resultsTitle}</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
            {lastProperties.slice(0, INLINE_RESULTS_LIMIT).map((property) => (
              <SearchResultCard key={property.id} property={property} />
            ))}
          </div>
          {lastProperties.length > INLINE_RESULTS_LIMIT && lastFilters && (
            <button
              type="button"
              onClick={handleViewAllResults}
              className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition"
            >
              {t.chat.viewAllResults} ({lastProperties.length})
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.chat.inputPlaceholder}
          className="flex-1 rounded-xl border border-stroke-default px-3.5 py-2.5 text-sm outline-none focus:border-brand-primary"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          aria-label={t.chat.send}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl p-2.5 transition disabled:opacity-60"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
