'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, MessageCircle, Users2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { Avatar } from '@/components/ui/avatar';
import { useAdminMessagingStats } from '@/features/admin/hooks/use-admin-messaging-stats';
import { useAdminUserMessagingStats } from '@/features/admin/hooks/use-admin-user-messaging-stats';
import { useAdminUserConversations } from '@/features/admin/hooks/use-admin-user-conversations';
import { TargetUserPicker } from '@/features/admin/components/target-user-picker';
import type { AdminSearchUser } from '@/features/admin/types';
import { RightRail } from '@/features/feed/components/right-rail';

const MONTH_LABELS_FR = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
];

// Toujours en français, même raison que app/admin/page.tsx:formatMonth — outil interne.
function formatMonth(month: string): string {
  const [year, monthIndex] = month.split('-');
  const label = MONTH_LABELS_FR[Number(monthIndex) - 1] ?? month;
  return `${label} ${year}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Statistiques de la messagerie (admin/superadmin uniquement) — voir
// strImmo/src/messaging/messaging.service.ts:getAdminStats/getAdminUserStats. Vue globale (total,
// par mois, utilisateurs les plus actifs) + recherche d'un utilisateur précis (même
// TargetUserPicker que les créations admin "pour le compte de", réutilisé ici en pure
// consultation, jamais pour publier quoi que ce soit).
export default function AdminMessagingStatsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const [selectedUser, setSelectedUser] = useState<AdminSearchUser | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: stats, isLoading } = useAdminMessagingStats(isAdminUser);
  const { data: userStats, isLoading: isLoadingUserStats } = useAdminUserMessagingStats(selectedUser?.id);
  const { data: userConversations, isLoading: isLoadingConversations } = useAdminUserConversations(selectedUser?.id);

  if (!isAdminUser) return null;

  const maxMonthCount = Math.max(1, ...(stats?.byMonth.map((m) => m.count) ?? [1]));
  const maxTopUserCount = Math.max(
    1,
    ...(stats?.topUsers.map((u) => u.sentCount + u.receivedCount) ?? [1])
  );

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
        >
          <ArrowLeft size={20} />
          {t.adminDashboard.title}
        </Link>

        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminMessagingStatsPage.title}</h1>
        <p className="text-sm text-content-muted mt-1">{t.adminMessagingStatsPage.subtitle}</p>

        {isLoading ? (
          <p className="text-sm text-content-muted mt-4">{t.search.searching}</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 text-center">
                <MessageCircle size={18} className="mx-auto text-brand-primary" />
                <div className="text-lg font-bold text-content-main mt-1">{stats.totalMessages}</div>
                <div className="text-[12px] text-content-muted">{t.adminMessagingStatsPage.totalMessages}</div>
              </div>
              <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 text-center">
                <Users2 size={18} className="mx-auto text-brand-primary" />
                <div className="text-lg font-bold text-content-main mt-1">{stats.totalConversations}</div>
                <div className="text-[12px] text-content-muted">{t.adminMessagingStatsPage.totalConversations}</div>
              </div>
            </div>

            {stats.byMonth.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-content-main mb-2">{t.adminMessagingStatsPage.byMonthTitle}</h2>
                <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-4 space-y-2">
                  {stats.byMonth.map((entry) => (
                    <div key={entry.month} className="flex items-center gap-3">
                      <span className="text-[0.85rem] text-content-muted w-16 shrink-0">{formatMonth(entry.month)}</span>
                      <div className="flex-1 h-3 rounded-full bg-surface-app overflow-hidden">
                        <div
                          className="h-full bg-brand-primary rounded-full"
                          style={{ width: `${(entry.count / maxMonthCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-[0.85rem] font-semibold text-content-main w-10 text-right shrink-0">
                        {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-sm font-bold text-content-main mb-2">{t.adminMessagingStatsPage.topUsersTitle}</h2>
              {stats.topUsers.length > 0 ? (
                <div className="bg-surface-card border border-stroke-default/80 rounded-xl divide-y divide-stroke-default">
                  {stats.topUsers.map((entry) => (
                    <button
                      key={entry.userId}
                      type="button"
                      onClick={() =>
                        setSelectedUser({
                          id: entry.userId,
                          firstName: entry.userName,
                          lastName: '',
                          phone: null,
                          role: 'owner',
                          isAnonymous: false,
                        })
                      }
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-app transition"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-content-main truncate block">{entry.userName}</span>
                        <div className="h-1.5 rounded-full bg-surface-app overflow-hidden mt-1 max-w-[160px]">
                          <div
                            className="h-full bg-brand-primary rounded-full"
                            style={{ width: `${((entry.sentCount + entry.receivedCount) / maxTopUserCount) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[0.85rem] font-semibold shrink-0">
                        <span className="text-content-main">{entry.sentCount} {t.adminMessagingStatsPage.sentLabel.toLowerCase()}</span>
                        <span className="text-content-muted">{entry.receivedCount} {t.adminMessagingStatsPage.receivedLabel.toLowerCase()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-content-muted">{t.adminMessagingStatsPage.noDataYet}</p>
              )}
            </div>
          </>
        ) : null}

        <div className="mt-8">
          <h2 className="text-sm font-bold text-content-main mb-1">{t.adminMessagingStatsPage.searchUserTitle}</h2>
          <p className="text-[0.85rem] text-content-muted mb-2">{t.adminMessagingStatsPage.searchUserHint}</p>
          <TargetUserPicker selected={selectedUser} onSelect={setSelectedUser} />

          {selectedUser && (
            <div className="mt-3 bg-surface-card border border-stroke-default/80 rounded-xl p-4">
              {isLoadingUserStats ? (
                <p className="text-sm text-content-muted">{t.search.searching}</p>
              ) : userStats ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-base font-bold text-content-main">{userStats.sentCount}</div>
                      <div className="text-[11px] text-content-muted">{t.adminMessagingStatsPage.sentLabel}</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-content-main">{userStats.receivedCount}</div>
                      <div className="text-[11px] text-content-muted">{t.adminMessagingStatsPage.receivedLabel}</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-content-main">{userStats.conversationCount}</div>
                      <div className="text-[11px] text-content-muted">{t.adminMessagingStatsPage.conversationsLabel}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[0.85rem] text-content-muted pt-2 border-t border-stroke-default">
                    <span>
                      {t.adminMessagingStatsPage.firstMessageLabel} :{' '}
                      <strong className="text-content-main">
                        {userStats.firstMessageAt ? formatDate(userStats.firstMessageAt) : t.adminMessagingStatsPage.never}
                      </strong>
                    </span>
                    <span>
                      {t.adminMessagingStatsPage.lastMessageLabel} :{' '}
                      <strong className="text-content-main">
                        {userStats.lastMessageAt ? formatDate(userStats.lastMessageAt) : t.adminMessagingStatsPage.never}
                      </strong>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Avec qui cet utilisateur discute — chaque ligne ouvre le contenu complet de la
              conversation (voir app/admin/messagerie/[id]/page.tsx), lecture seule. */}
          {selectedUser && (
            <div className="mt-3">
              <h3 className="text-[0.85rem] font-bold text-content-main mb-1.5">
                {t.adminMessagingStatsPage.conversationsListTitle}
              </h3>
              {isLoadingConversations ? (
                <p className="text-sm text-content-muted">{t.search.searching}</p>
              ) : userConversations && userConversations.length > 0 ? (
                <div className="bg-surface-card border border-stroke-default/80 rounded-xl divide-y divide-stroke-default">
                  {userConversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/admin/messagerie/${conversation.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-app transition"
                    >
                      <Avatar name={conversation.participantName} imageUrl={conversation.participantAvatarUrl} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-content-main truncate">{conversation.participantName}</p>
                        {conversation.lastMessage && (
                          <p className="text-[0.8rem] text-content-muted truncate">{conversation.lastMessage}</p>
                        )}
                      </div>
                      <ChevronRight size={18} className="shrink-0 text-content-muted" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-content-muted">{t.adminMessagingStatsPage.noDataYet}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <RightRail />
    </div>
  );
}
