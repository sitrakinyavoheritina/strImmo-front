'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { BulkEmailForm } from '@/features/admin/components/bulk-email-form';

export default function AdminBulkEmailPage() {
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

  if (!isAdminUser) return null;

  return (
    <div className="max-w-md mx-auto px-3 sm:px-6 lg:px-0 py-3 sm:py-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
      >
        <ArrowLeft size={20} />
        {t.adminDashboard.title}
      </Link>
      <h1 className="text-lg font-bold text-brand-secondary-text">{t.adminBroadcastPage.emailTitle}</h1>
      <p className="text-[0.85rem] text-content-muted mt-1 mb-4">{t.adminBroadcastPage.emailSubtitle}</p>

      <div className="bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-5">
        <BulkEmailForm />
      </div>
    </div>
  );
}
