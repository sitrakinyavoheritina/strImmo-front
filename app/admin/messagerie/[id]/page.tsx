'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { Avatar } from '@/components/ui/avatar';
import { useAdminConversation } from '@/features/admin/hooks/use-admin-conversation';
import { RightRail } from '@/features/feed/components/right-rail';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Contenu complet d'une conversation, lu par un admin à des fins de modération — jamais de point
// de vue "moi"/"l'autre" comme app/messages/[id]/page.tsx (un admin n'est participant d'aucune des
// deux) : chaque message porte le nom de son expéditeur, les deux participants ont chacun leur
// propre couleur de fond, en ordre chronologique simple (transcript), pas de bulles alignées
// gauche/droite qui supposeraient un point de vue. Lecture seule : pas de champ de saisie.
export default function AdminConversationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: conversation, isLoading } = useAdminConversation(isAdminUser ? params.id : undefined);

  if (!isAdminUser) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl mx-auto">
        <Link
          href="/admin/messagerie"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
        >
          <ArrowLeft size={20} />
          {t.adminMessagingStatsPage.title}
        </Link>

        {isLoading ? (
          <p className="text-sm text-content-muted mt-4">{t.search.searching}</p>
        ) : conversation ? (
          <>
            <div className="flex items-center gap-4 bg-surface-card border border-stroke-default/80 rounded-xl p-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar name={conversation.userA.name} imageUrl={conversation.userA.avatarUrl} size={32} />
                <span className="text-sm font-semibold text-content-main truncate">{conversation.userA.name}</span>
              </div>
              <span className="text-content-muted text-xs shrink-0">↔</span>
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                <span className="text-sm font-semibold text-content-main truncate">{conversation.userB.name}</span>
                <Avatar name={conversation.userB.name} imageUrl={conversation.userB.avatarUrl} size={32} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {conversation.messages.length === 0 ? (
                <p className="text-sm text-content-muted">{t.adminMessagingStatsPage.noDataYet}</p>
              ) : (
                conversation.messages.map((message) => {
                  const isUserA = message.senderId === conversation.userA.id;
                  const senderName = isUserA ? conversation.userA.name : conversation.userB.name;
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-xl px-3 py-2 ${
                        isUserA ? 'bg-surface-card border border-stroke-default/80' : 'bg-brand-primary-soft ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[0.75rem] font-semibold text-content-muted">{senderName}</span>
                        <span className="text-[0.7rem] text-content-muted shrink-0">{formatDateTime(message.sentAt)}</span>
                      </div>
                      {message.text && <p className="text-sm text-content-main mt-0.5 whitespace-pre-line">{message.text}</p>}
                      {message.imageUrl && (
                        <a
                          href={message.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1.5 text-[0.85rem] font-semibold text-brand-primary hover:underline"
                        >
                          <ImageIcon size={16} />
                          {t.adminMessagingStatsPage.viewImage}
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : null}
      </div>
      <RightRail />
    </div>
  );
}
