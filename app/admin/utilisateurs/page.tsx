'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users';
import { AdminUserListItem } from '@/features/admin/components/admin-user-list-item';
import { RightRail } from '@/features/feed/components/right-rail';

// Liste de tous les comptes inscrits sur la plateforme — demandé explicitement ("liste des
// utilisateurs dispo dans le site... avec quelques détails importants"). Même gabarit que
// /admin/annonces (garde admin, RightRail) — pas d'onglets par rôle pour l'instant, un seul flux
// trié du plus récent au plus ancien (voir strImmo/src/auth/auth.service.ts:listUsers).
export default function AdminUtilisateursPage() {
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

  const { data: users, isLoading } = useAdminUsers({ enabled: isAdminUser });

  if (!isAdminUser) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminUsersPage.title}</h1>
        <p className="text-sm text-content-muted mt-1">
          {isLoading ? t.search.searching : `${users?.length ?? 0} ${t.adminUsersPage.subtitle}`}
        </p>

        {isLoading ? (
          <p className="text-sm text-content-muted mt-4">{t.search.searching}</p>
        ) : users && users.length > 0 ? (
          <div className="space-y-2 mt-4">
            {users.map((u) => (
              <AdminUserListItem key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <div className="mt-4 bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
            <Users size={32} className="text-content-muted" />
            <p className="font-semibold text-content-main">{t.adminUsersPage.emptyTitle}</p>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
