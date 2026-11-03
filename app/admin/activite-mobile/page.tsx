'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Smartphone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useAdminActivityUsers } from '@/features/admin/hooks/use-admin-activity-users';
import { useAdminUserActivity } from '@/features/admin/hooks/use-admin-user-activity';
import { formatRelativeTime } from '@/features/search/utils/format-relative-time';
import type { UserActivityAction } from '@/features/admin/types';
import type { UserRole } from '@/features/auth/types';
import { RightRail } from '@/features/feed/components/right-rail';

const ROLE_LABEL_KEY = {
  owner: 'roleOwner',
  tenant: 'roleTenant',
  agent: 'roleAgent',
  agency: 'roleAgency',
  admin: 'roleAdmin',
  superadmin: 'roleSuperadmin',
} as const satisfies Record<UserRole, string>;

const ACTION_LABEL_KEY = {
  login: 'actionLogin',
  register: 'actionRegister',
  search: 'actionSearch',
  filter_property: 'actionFilterProperty',
  favorite_property: 'actionFavoriteProperty',
  like_property_request: 'actionLikePropertyRequest',
  contact_owner: 'actionContactOwner',
  send_message: 'actionSendMessage',
  view_property: 'actionViewProperty',
  publish_property: 'actionPublishProperty',
} as const satisfies Record<UserActivityAction, string>;

// Activité des utilisateurs côté app mobile uniquement (voir POST /user-activity, jamais appelé
// par le web) — triée par dernière activité, les jamais actifs en premier : pensé pour repérer
// d'un coup d'œil des testeurs (Google Play, test fermé) qui ont installé l'app sans jamais
// l'ouvrir/l'utiliser. Même squelette que app/admin/messagerie/page.tsx (liste + panneau de
// détail sous la ligne cliquée, pas une route séparée).
export default function AdminMobileActivityPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);

  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data, isLoading } = useAdminActivityUsers(page, isAdminUser);
  const { data: detail, isLoading: isLoadingDetail } = useAdminUserActivity(
    selectedUserId ?? undefined,
    detailPage
  );

  if (!isAdminUser) return null;

  function selectUser(userId: string) {
    setSelectedUserId((current) => (current === userId ? null : userId));
    setDetailPage(1);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const detailTotalPages = detail ? Math.max(1, Math.ceil(detail.total / detail.limit)) : 1;

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

        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text flex items-center gap-2">
          <Smartphone size={20} className="text-brand-primary" />
          {t.adminActivityPage.title}
        </h1>
        <p className="text-sm text-content-muted mt-1">{t.adminActivityPage.subtitle}</p>

        {isLoading ? (
          <p className="text-sm text-content-muted mt-4">{t.adminActivityPage.loading}</p>
        ) : data && data.users.length > 0 ? (
          <div className="mt-4 bg-surface-card border border-stroke-default/80 rounded-xl divide-y divide-stroke-default">
            {data.users.map((activityUser) => (
              <div key={activityUser.id}>
                <button
                  type="button"
                  onClick={() => selectUser(activityUser.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-app transition"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-content-main truncate block">
                      {activityUser.name || activityUser.phone || activityUser.email}
                    </span>
                    <span className="text-[0.8rem] text-content-muted">
                      {t.auth[ROLE_LABEL_KEY[activityUser.role as UserRole] ?? 'roleTenant']}
                      {activityUser.phone ? ` · ${activityUser.phone}` : ''}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[0.85rem] font-semibold block ${
                        activityUser.lastActiveAt ? 'text-content-main' : 'text-danger'
                      }`}
                    >
                      {activityUser.lastActiveAt
                        ? formatRelativeTime(activityUser.lastActiveAt)
                        : t.adminActivityPage.never}
                    </span>
                    <span className="text-[0.75rem] text-content-muted">
                      {activityUser.actionCount} {t.adminActivityPage.actionsColumn.toLowerCase()}
                    </span>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 text-content-muted transition ${
                      selectedUserId === activityUser.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {selectedUserId === activityUser.id && (
                  <div className="px-4 pb-4 bg-surface-app/60">
                    <h2 className="text-[0.85rem] font-bold text-content-main pt-3 mb-2">
                      {t.adminActivityPage.detailTitle}
                    </h2>
                    {isLoadingDetail ? (
                      <p className="text-[0.85rem] text-content-muted">{t.adminActivityPage.loading}</p>
                    ) : detail && detail.actions.length > 0 ? (
                      <>
                        <ul className="space-y-1.5">
                          {detail.actions.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex items-center justify-between gap-2 bg-surface-card border border-stroke-default/60 rounded-lg px-3 py-2"
                            >
                              <span className="text-[0.85rem] font-medium text-content-main">
                                {t.adminActivityPage[ACTION_LABEL_KEY[entry.action]] ?? entry.action}
                              </span>
                              <span className="text-[0.8rem] text-content-muted shrink-0">
                                {formatRelativeTime(entry.createdAt)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {detailTotalPages > 1 && (
                          <div className="flex items-center justify-between mt-2">
                            <button
                              type="button"
                              disabled={detailPage <= 1}
                              onClick={() => setDetailPage((p) => p - 1)}
                              className="text-[0.8rem] font-semibold text-brand-primary disabled:text-content-muted disabled:cursor-default"
                            >
                              {t.adminActivityPage.previous}
                            </button>
                            <span className="text-[0.75rem] text-content-muted">
                              {t.adminActivityPage.pageLabel} {detailPage}/{detailTotalPages}
                            </span>
                            <button
                              type="button"
                              disabled={detailPage >= detailTotalPages}
                              onClick={() => setDetailPage((p) => p + 1)}
                              className="text-[0.8rem] font-semibold text-brand-primary disabled:text-content-muted disabled:cursor-default"
                            >
                              {t.adminActivityPage.next}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[0.85rem] text-content-muted">{t.adminActivityPage.noActivity}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-muted mt-4">{t.adminActivityPage.noUsers}</p>
        )}

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm font-semibold text-brand-primary disabled:text-content-muted disabled:cursor-default"
            >
              {t.adminActivityPage.previous}
            </button>
            <span className="text-[0.85rem] text-content-muted">
              {t.adminActivityPage.pageLabel} {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm font-semibold text-brand-primary disabled:text-content-muted disabled:cursor-default"
            >
              {t.adminActivityPage.next}
            </button>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
