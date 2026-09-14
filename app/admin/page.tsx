'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, XCircle, ArrowRight, List } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useProperties } from '@/features/search/hooks/use-properties';
import { usePropertyStats } from '@/features/search/hooks/use-property-stats';
import { RightRail } from '@/features/feed/components/right-rail';

const MONTH_LABELS_FR = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
];

// Toujours en français (pas de noms de mois malgaches maintenus ici) — outil interne réservé à
// l'équipe, pas une page publique multilingue.
function formatMonth(month: string): string {
  const [year, monthIndex] = month.split('-');
  const label = MONTH_LABELS_FR[Number(monthIndex) - 1] ?? month;
  return `${label} ${year}`;
}

// Page d'atterrissage d'un compte admin/superadmin à la connexion (voir use-login.ts) et entrée
// "Administration" de la navigation (voir nav-items.ts) — remplace /validation comme destination
// directe, demandé explicitement ("on redirige vers la page admin ... sous forme de dashboard
// admin"). Seul module admin existant côté backend pour l'instant : la modération des annonces
// (voir strImmo/src/properties/properties.controller.ts, `@Roles('admin','superadmin')`) — les
// compteurs ci-dessous reflètent uniquement ça, pas de gestion des comptes/statistiques générales
// tant que le backend n'expose rien de plus.
export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: pending } = useProperties({ status: 'pending' }, { enabled: isAdminUser });
  const { data: approved } = useProperties({ status: 'approved' }, { enabled: isAdminUser });
  const { data: rejected } = useProperties({ status: 'rejected' }, { enabled: isAdminUser });
  const { data: stats } = usePropertyStats({ enabled: isAdminUser });

  if (!isAdminUser) return null;

  const pendingCount = pending?.length ?? 0;
  const maxMonthCount = Math.max(1, ...(stats?.byMonth.map((m) => m.count) ?? [1]));

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminDashboard.title}</h1>
        <p className="text-sm text-content-muted mt-1">{t.adminDashboard.subtitle}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 text-center">
            <Clock size={18} className="mx-auto text-brand-primary" />
            <div className="text-lg font-bold text-content-main mt-1">{pending?.length ?? '—'}</div>
            <div className="text-[11px] text-content-muted">{t.adminDashboard.pendingLabel}</div>
          </div>
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 text-center">
            <CheckCircle2 size={18} className="mx-auto text-emerald-600" />
            <div className="text-lg font-bold text-content-main mt-1">{approved?.length ?? '—'}</div>
            <div className="text-[11px] text-content-muted">{t.adminDashboard.approvedLabel}</div>
          </div>
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 text-center">
            <XCircle size={18} className="mx-auto text-danger" />
            <div className="text-lg font-bold text-content-main mt-1">{rejected?.length ?? '—'}</div>
            <div className="text-[11px] text-content-muted">{t.adminDashboard.rejectedLabel}</div>
          </div>
        </div>

        <Link
          href="/validation"
          className="mt-4 flex items-center justify-between gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-4 hover:border-brand-primary/40 transition"
        >
          <div>
            <p className="font-semibold text-content-main">{t.adminDashboard.pendingCta}</p>
            <p className="text-xs text-content-muted mt-0.5">
              {pendingCount > 0
                ? `${pendingCount} ${t.adminDashboard.pendingLabel.toLowerCase()}`
                : t.adminDashboard.noPending}
            </p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-brand-primary" />
        </Link>

        <Link
          href="/admin/annonces"
          className="mt-2 flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-4 hover:border-brand-primary/40 transition"
        >
          <List size={18} className="shrink-0 text-brand-primary" />
          <p className="font-semibold text-content-main flex-1">{t.adminDashboard.allListingsCta}</p>
          <ArrowRight size={18} className="shrink-0 text-content-muted" />
        </Link>

        {/* Annonces par mois — barres proportionnelles au mois le plus chargé, pas de librairie de
            graphiques pour un simple histogramme à 12 barres. */}
        {stats && stats.byMonth.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-content-main mb-2">{t.adminDashboard.byMonthTitle}</h2>
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-4 space-y-2">
              {stats.byMonth.map((entry) => (
                <div key={entry.month} className="flex items-center gap-3">
                  <span className="text-xs text-content-muted w-16 shrink-0">{formatMonth(entry.month)}</span>
                  <div className="flex-1 h-3 rounded-full bg-surface-app overflow-hidden">
                    <div
                      className="h-full bg-brand-primary rounded-full"
                      style={{ width: `${(entry.count / maxMonthCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-content-main w-6 text-right shrink-0">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validations/refus par membre de l'équipe — vide tant qu'aucune modération n'a encore
            été faite APRÈS l'ajout de ce suivi (voir Property.moderatedBy) : l'historique antérieur
            n'a pas cette info. */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-content-main mb-2">{t.adminDashboard.byModeratorTitle}</h2>
          {stats && stats.byModerator.length > 0 ? (
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl divide-y divide-stroke-default">
              {stats.byModerator.map((entry) => (
                <div key={entry.moderatorId} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-sm font-medium text-content-main truncate">{entry.moderatorName}</span>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <span className="text-emerald-600">{entry.approvedCount} {t.adminDashboard.approvedLabel.toLowerCase()}</span>
                    <span className="text-danger">{entry.rejectedCount} {t.adminDashboard.rejectedLabel.toLowerCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-muted">{t.adminDashboard.noModerationYet}</p>
          )}
        </div>
      </div>
      <RightRail />
    </div>
  );
}
