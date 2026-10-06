'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { AdminCreateUserForm } from '@/features/admin/components/admin-create-user-form';
import { Button } from '@/components/ui/button';
import type { CreateUserAsAdminResponse } from '@/features/admin/types';

export default function NouvelUtilisateurPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const [created, setCreated] = useState<CreateUserAsAdminResponse | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  if (!isAdminUser) return null;

  return (
    <div className="max-w-md mx-auto px-3 sm:px-6 lg:px-0 py-3 sm:py-6">
      <Link
        href="/admin/utilisateurs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
      >
        <ArrowLeft size={20} />
        {t.adminUsersPage.title}
      </Link>
      <h1 className="text-lg font-bold text-brand-secondary-text">{t.adminCreateUserPage.title}</h1>
      <p className="text-[0.85rem] text-content-muted mt-1 mb-4">{t.adminCreateUserPage.subtitle}</p>

      {created ? (
        <div className="bg-surface-card border border-stroke-default/80 rounded-2xl p-4 space-y-3 text-center">
          <CheckCircle2 size={32} className="mx-auto text-brand-primary" />
          <p className="font-semibold text-content-main">{t.adminCreateUserPage.successTitle}</p>
          <p className="text-sm text-content-main">
            {t.adminCreateUserPage.successPasswordLabel}{' '}
            <span className="font-mono font-bold">{created.sharedPassword}</span>
          </p>
          <div className="flex gap-2 justify-center pt-1">
            <Button type="button" variant="outline" onClick={() => setCreated(null)}>
              {t.adminCreateUserPage.createAnother}
            </Button>
            <Button type="button" onClick={() => router.push(`/admin/utilisateurs/${created.user.id}`)}>
              {t.adminCreateUserPage.viewUser}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-5">
          <AdminCreateUserForm onCreated={setCreated} />
        </div>
      )}
    </div>
  );
}
