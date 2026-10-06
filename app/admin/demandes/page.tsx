'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, Flag } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import {
  useAdminPropertyRequests,
  useAdminDeletedPropertyRequests,
  useAdminDeletePropertyRequest,
} from '@/features/property-requests/hooks/use-property-requests';
import { requestSentence, requestTitle } from '@/features/property-requests/utils/request-summary';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';

type Tab = 'active' | 'deleted';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Vue admin des demandes (recherches enregistrées) : toutes, publiques ou non, avec l'auteur en
// clair (l'anonymat du tableau public — voir PublicBoardCard — ne s'applique qu'aux vendeurs, pas
// à la modération). Pas de file de modération séparée comme pour les annonces signalées
// (voir /admin/signalements) : une seule liste, triée par date, avec le nombre de signalements
// affiché sur chaque ligne — le volume de demandes reste faible pour l'instant. Onglet
// "Supprimées" (demandé explicitement) : les demandes ne sont jamais réellement retirées de la
// base (voir PropertyRequest.deletedAt), juste masquées partout ailleurs — seul cet onglet les
// revoit, sans bouton Supprimer (déjà fait).
export default function AdminDemandesPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: requests, isLoading } = useAdminPropertyRequests(isAdminUser && tab === 'active');
  const { data: deletedRequests, isLoading: isLoadingDeleted } = useAdminDeletedPropertyRequests(
    isAdminUser && tab === 'deleted'
  );
  const { mutate: remove, isPending: isDeleting } = useAdminDeletePropertyRequest();

  if (!isAdminUser) return null;

  const list = tab === 'active' ? requests : deletedRequests;
  const loading = tab === 'active' ? isLoading : isLoadingDeleted;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminDemandesPage.title}</h1>
          <Link href="/admin/demandes/nouveau">
            <Button type="button" size="sm">
              {t.adminDemandesPage.newRequest}
            </Button>
          </Link>
        </div>
        <p className="text-[0.85rem] text-content-muted mt-1">{t.adminDemandesPage.subtitle}</p>

        <div className="flex items-center gap-1 rounded-xl border border-stroke-default bg-surface-app p-1 text-[0.85rem] font-semibold mt-3 mb-4 max-w-xs">
          <button
            type="button"
            onClick={() => setTab('active')}
            aria-pressed={tab === 'active'}
            className={`flex-1 px-2.5 py-1.5 rounded-lg transition ${
              tab === 'active' ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
            }`}
          >
            {t.adminDemandesPage.tabActive}
          </button>
          <button
            type="button"
            onClick={() => setTab('deleted')}
            aria-pressed={tab === 'deleted'}
            className={`flex-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg transition ${
              tab === 'deleted' ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
            }`}
          >
            {t.adminDemandesPage.tabDeleted}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-content-muted mt-4">{t.search.searching}</p>
        ) : list && list.length > 0 ? (
          <div className="space-y-2">
            {list.map((request) => (
              <div key={request.id} className="bg-surface-card border border-stroke-default/80 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-secondary-text">{requestTitle(request, locale)}</p>
                    <p className="text-sm text-content-main whitespace-pre-line mt-0.5">{requestSentence(request, locale)}</p>
                  </div>
                  {tab === 'active' && (
                    <span
                      className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        request.isPublic
                          ? 'bg-brand-primary-soft text-brand-primary'
                          : 'bg-surface-app text-content-muted border border-stroke-default'
                      }`}
                    >
                      {request.isPublic ? t.propertyRequestsPage.publicBadge : t.propertyRequestsPage.privateBadge}
                    </span>
                  )}
                </div>

                <p className="text-[0.85rem] text-content-muted mt-2">
                  {t.adminDemandesPage.by} {request.authorName} · {request.authorPhone}
                </p>
                {request.createdByAdminId && (
                  <p className="text-[12px] font-semibold text-brand-primary mt-0.5">
                    {t.adminDemandesPage.createdByAdmin} {request.createdByAdminName}
                  </p>
                )}

                {tab === 'active' && request.reportCount > 0 && (
                  <p className="flex items-center gap-1 text-[0.85rem] font-semibold text-danger mt-1">
                    <Flag size={14} className="shrink-0" />
                    {request.reportCount} {t.adminDemandesPage.reportCount}
                  </p>
                )}

                {tab === 'deleted' && request.deletedAt && (
                  <p className="text-[12px] text-danger mt-1">
                    {t.adminDemandesPage.deletedOn} {formatDate(request.deletedAt)}
                  </p>
                )}

                {tab === 'active' && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      if (window.confirm(t.adminDemandesPage.deleteConfirm)) remove(request.id);
                    }}
                    className="mt-2.5 text-[0.85rem] font-semibold text-danger hover:underline disabled:opacity-50"
                  >
                    {t.adminDemandesPage.delete}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl shadow-sm flex flex-col items-center gap-2 py-16 text-center">
            <ClipboardList size={32} className="text-content-muted" />
            <p className="text-sm text-content-muted">{t.adminDemandesPage.emptyTitle}</p>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
