'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useReportedProperties } from '@/features/search/hooks/use-report-property';
import { RightRail } from '@/features/feed/components/right-rail';

// Annonces signalées par les utilisateurs, les plus signalées d'abord — la suppression se fait
// depuis /admin/supprimer-bien (avec l'identifiant affiché ici).
export default function AdminSignalementsPage() {
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

  const { data: reports, isLoading } = useReportedProperties(isAdminUser);

  if (!isAdminUser) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminReportsPage.title}</h1>
        {isLoading ? (
          <p className="text-sm text-content-muted mt-4">{t.search.searching}</p>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-2 mt-4">
            {reports.map((report) => (
              <div key={report.propertyId} className="bg-surface-card border border-stroke-default/80 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Flag size={16} className="shrink-0 text-danger mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-content-main truncate">{report.title}</p>
                    <p className="text-[0.85rem] text-content-muted truncate">{report.location}</p>
                    <p className="text-[12px] text-content-muted mt-1">
                      {report.count} {t.adminReportsPage.reports} · {report.reasons.map((r) => t.adminReportsPage[r]).join(', ')}
                    </p>
                    <p className="text-[12px] font-mono text-content-muted mt-1 break-all">{report.propertyId}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/annonce/${report.propertyId}`}
                    className="text-[0.85rem] font-semibold text-brand-primary hover:underline"
                  >
                    {t.adminReportsPage.view}
                  </Link>
                  <Link
                    href="/admin/supprimer-bien"
                    className="text-[0.85rem] font-semibold text-danger hover:underline"
                  >
                    {t.adminReportsPage.delete}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-muted py-12 text-center">{t.adminReportsPage.empty}</p>
        )}
      </div>
      <RightRail />
    </div>
  );
}
