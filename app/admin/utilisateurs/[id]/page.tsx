'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useAdminUserDetail } from '@/features/admin/hooks/use-admin-user-detail';
import { isUnvalidatedAccount } from '@/features/admin/components/admin-user-list-item';
import { STATUS_BADGE_CLASS, STATUS_LABEL_KEY } from '@/features/listings/utils/status-badge';
import { formatPrice } from '@/features/search/utils/format-price';
import { RightRail } from '@/features/feed/components/right-rail';
import type { UserRole } from '@/features/auth/types';

const ROLE_LABEL_KEY = {
  owner: 'roleOwner',
  tenant: 'roleTenant',
  agent: 'roleAgent',
  agency: 'roleAgency',
  admin: 'roleAdmin',
  superadmin: 'roleSuperadmin',
} as const satisfies Record<UserRole, string>;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-stroke-default/60 last:border-0">
      <span className="shrink-0 text-[0.85rem] text-content-muted">{label}</span>
      <span className="min-w-0 text-right text-sm text-content-main break-words">{children}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 bg-surface-card border border-stroke-default/80 rounded-xl p-3">
      <h2 className="text-sm font-bold text-brand-secondary-text mb-1">{title}</h2>
      {children}
    </section>
  );
}

// Fiche d'un compte, en LECTURE SEULE (admin/superadmin) : aucune action de modification ici —
// la suppression reste dans la liste, les annonces s'ouvrent dans leur page de détail.
export default function AdminUserDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(currentUser);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: user, isLoading, isError } = useAdminUserDetail(id, isAdminUser);
  const d = t.adminUserDetailPage;
  const date = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const dash = '—';

  if (!isAdminUser) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <Link
          href="/admin/utilisateurs"
          className="inline-flex items-center gap-1 text-sm font-semibold text-content-muted hover:text-content-main"
        >
          <ArrowLeft size={16} />
          {d.back}
        </Link>

        {isLoading ? (
          <p className="mt-4 text-sm text-content-muted">{t.search.searching}</p>
        ) : isError || !user ? (
          <p className="mt-6 text-center text-sm text-content-muted">{d.notFound}</p>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-3">
              <Avatar
                name={`${user.firstName} ${user.lastName}`.trim() || user.email || '?'}
                imageUrl={user.avatarUrl ?? undefined}
                size={56}
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text truncate">
                  {`${user.firstName} ${user.lastName}`.trim() || dash}
                </h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-brand-primary-soft text-brand-primary">
                    {t.auth[ROLE_LABEL_KEY[user.role]]}
                  </span>
                  {isUnvalidatedAccount(user) && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS.pending}`}
                    >
                      <AlertCircle size={10} />
                      {t.adminUsersPage.notValidated}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-2 inline-flex items-center gap-1.5 text-[0.85rem] text-content-muted">
              <Eye size={14} />
              {d.readOnly}
            </p>

            {isUnvalidatedAccount(user) && (
              <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[0.85rem] font-semibold text-amber-900">
                {t.adminUsersPage.notValidatedHint}
              </p>
            )}

            <Card title={d.contact}>
              <Row label={d.phone}>
                {user.phone ?? dash}
                {user.phone &&
                  (user.isPhoneVerified ? (
                    <CheckCircle2 size={13} className="ml-1 inline text-brand-primary" />
                  ) : (
                    <span className="ml-1 text-[12px] font-semibold text-amber-700">({d.notVerified})</span>
                  ))}
              </Row>
              <Row label={d.phone2}>{user.phone2 ?? dash}</Row>
              <Row label={d.email}>
                {user.email ?? dash}
                {user.email &&
                  (user.isEmailVerified ? (
                    <CheckCircle2 size={13} className="ml-1 inline text-brand-primary" />
                  ) : (
                    <span className="ml-1 text-[12px] text-content-muted">({d.notVerified})</span>
                  ))}
              </Row>
              <Row label={d.address}>{user.address ?? dash}</Row>
            </Card>

            <Card title={d.account}>
              <Row label={d.loginMethod}>{user.hasPassword ? t.adminUsersPage.loginPassword : t.adminUsersPage.loginGoogle}</Row>
              <Row label={t.adminUsersPage.joinedOn}>{date(user.createdAt)}</Row>
              <Row label={d.updatedOn}>{date(user.updatedAt)}</Row>
              <Row label={d.userId}>
                <span className="font-mono text-[12px]">{user.id}</span>
              </Row>
            </Card>

            {user.agentProfile && (
              <Card title={d.agentProfile}>
                <Row label={d.fileStatus}>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS[user.agentProfile.status]}`}>
                    {t.myPropertiesPage[STATUS_LABEL_KEY[user.agentProfile.status]]}
                  </span>
                </Row>
                <Row label={d.cin}>{user.agentProfile.hasCin ? d.provided : d.notProvided}</Row>
                {user.agentProfile.rejectionReason && <Row label={d.rejectionReason}>{user.agentProfile.rejectionReason}</Row>}
              </Card>
            )}

            {user.agencyProfile && (
              <Card title={d.agencyProfile}>
                <Row label={d.agencyName}>{user.agencyProfile.agencyName}</Row>
                <Row label={d.address}>{user.agencyProfile.address}</Row>
                <Row label={d.fileStatus}>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS[user.agencyProfile.status]}`}>
                    {t.myPropertiesPage[STATUS_LABEL_KEY[user.agencyProfile.status]]}
                  </span>
                </Row>
                <Row label={d.website}>{user.agencyProfile.website ?? dash}</Row>
                <Row label="Facebook">{user.agencyProfile.facebookUrl ?? dash}</Row>
                <Row label="NIF">{user.agencyProfile.nifNumber ?? (user.agencyProfile.hasNif ? d.provided : dash)}</Row>
                <Row label="STAT">{user.agencyProfile.statNumber ?? (user.agencyProfile.hasStat ? d.provided : dash)}</Row>
                {user.agencyProfile.description && <Row label={d.description}>{user.agencyProfile.description}</Row>}
                {user.agencyProfile.rejectionReason && <Row label={d.rejectionReason}>{user.agencyProfile.rejectionReason}</Row>}
              </Card>
            )}

            <Card title={`${d.listings} (${user.properties.length})`}>
              {user.properties.length === 0 ? (
                <p className="py-2 text-sm text-content-muted">{d.noListings}</p>
              ) : (
                <div className="space-y-1.5 mt-1">
                  {user.properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/annonce/${property.id}`}
                      className="flex items-center gap-2 rounded-lg border border-stroke-default/60 p-2 hover:border-brand-primary/40 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-content-main">{property.title}</p>
                        <p className="truncate text-[0.85rem] text-content-muted">{property.location}</p>
                        <p className="text-[0.85rem] font-bold text-brand-secondary-text">{formatPrice(property.price)}</p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS[property.moderationStatus]}`}
                      >
                        {t.myPropertiesPage[STATUS_LABEL_KEY[property.moderationStatus]]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
      <RightRail />
    </div>
  );
}
