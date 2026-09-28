'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useRequestLikesStore } from '@/lib/state/use-request-likes-store';
import { useStartConversation } from '@/features/messages/hooks/use-messages';
import { formatRelativeTime } from '@/features/search/utils/format-relative-time';
import { AnonymousAvatar } from './anonymous-avatar';
import { PropertyRequestOptionsMenu } from './property-request-options-menu';
import { useLikePropertyRequest } from '../hooks/use-property-requests';
import { requestCriteriaLabels, requestSentence, requestTitle } from '../utils/request-summary';
import type { PropertyRequest } from '../types/property-request.types';

function formatCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);
}

/** Carte du tableau public (vendeurs parcourant les demandes des acheteurs) — même registre
 *  visuel qu'une carte d'annonce du fil (avatar + nom, cœur, message, "...", voir
 *  FeedPropertyCard), avec deux différences volontaires liées à l'anonymat de l'auteur :
 *  - avatar générique (AnonymousAvatar) et nom générique ("Membre anonyme"), jamais l'identité
 *    réelle ni sa photo ;
 *  - "message" ouvre directement une conversation plutôt qu'un numéro de téléphone (jamais
 *    affiché tant que l'auteur n'a pas répondu lui-même, voir le texte de visibilité à la
 *    création d'une demande).
 *  `authorLabel` distingue les auteurs entre eux sur le tableau ("Membre anonyme", "Membre
 *  anonyme 2"...) sans jamais révéler qui ils sont — calculé par le parent à partir de
 *  `request.userId` (le seul champ transmis par l'API qui les différencie, voir
 *  app/demandes/page.tsx), jamais affiché tel quel. */
export function PublicBoardCard({ request, authorLabel }: { request: PropertyRequest; authorLabel: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const isLiked = useRequestLikesStore((state) => (userId ? state.likedByUser[userId] : undefined)?.includes(request.id) ?? false);
  const { mutate: toggleLike } = useLikePropertyRequest();
  const { mutate: startConversation, isPending: isStartingConversation } = useStartConversation();
  const [chatError, setChatError] = useState<string | null>(null);
  const criteriaLabels = requestCriteriaLabels(request, t);

  function handleLikeClick() {
    if (!isAuthenticated || !userId) {
      router.push('/connexion');
      return;
    }
    toggleLike({ id: request.id, wasLiked: isLiked, userId });
  }

  function handleChatClick() {
    if (!isAuthenticated) {
      router.push('/connexion');
      return;
    }
    setChatError(null);
    startConversation(
      { requestId: request.id },
      {
        onSuccess: (conversation) => router.push(`/messages/${conversation.id}`),
        // Ex. la demande vient d'être rendue privée par son auteur entre le chargement de la
        // page et ce clic — le backend refuse alors avec un message clair (voir
        // MessagingService.startFromPropertyRequest), affiché plutôt que de ne rien faire.
        onError: (error) => setChatError(getErrorMessage(error, t.propertyRequestsPage.contactError)),
      }
    );
  }

  return (
    <article className="bg-surface-card rounded-2xl border border-stroke-default/80 shadow-sm">
      <div className="flex items-center gap-2 px-3 pt-3">
        <AnonymousAvatar size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.85rem] font-semibold text-content-main truncate">{authorLabel}</p>
          <p className="text-[12px] text-content-muted">{formatRelativeTime(request.createdAt)}</p>
        </div>
      </div>

      <div className="px-3 py-2">
        <p className="text-sm font-bold text-brand-secondary-text">{requestTitle(request, locale)}</p>
        <p className="text-sm text-content-main whitespace-pre-line mt-0.5">{requestSentence(request, locale)}</p>
        {criteriaLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {criteriaLabels.map((label) => (
              <span
                key={label}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-app text-content-muted border border-stroke-default"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-t border-stroke-default">
        <div className="flex items-center gap-1 text-[0.85rem] font-medium text-content-muted">
          <button
            type="button"
            onClick={handleLikeClick}
            aria-label={isLiked ? t.propertyRequestsPage.unlike : t.propertyRequestsPage.like}
            aria-pressed={isLiked}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-danger/10 hover:text-danger transition"
          >
            <Heart size={20} className={isLiked ? 'text-danger fill-danger' : ''} />
            {formatCount(request.likesCount)}
          </button>
          <button
            type="button"
            disabled={isStartingConversation}
            onClick={handleChatClick}
            aria-label={t.propertyRequestsPage.contact}
            className="flex items-center px-2 py-1.5 rounded-full hover:bg-brand-primary/10 hover:text-brand-primary transition disabled:opacity-50"
          >
            <MessageCircle size={20} />
          </button>
        </div>
        <PropertyRequestOptionsMenu requestId={request.id} />
      </div>
      {chatError && <p className="px-3 pb-2 text-[0.85rem] text-danger">{chatError}</p>}
    </article>
  );
}
