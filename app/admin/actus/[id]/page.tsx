'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useNewsArticle } from '@/features/news/hooks/use-news';
import { useUpdateNews } from '@/features/news/hooks/use-news-admin';
import { NewsForm } from '@/features/news/components/news-form';
import { FormErrorBanner } from '@/components/ui/form-error-banner';

export default function ModifierArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const { data: article, isLoading } = useNewsArticle(id);
  const { mutate: updateArticle, isPending, error } = useUpdateNews();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  if (!isAdminUser) return null;

  return (
    <div className="max-w-md mx-auto px-3 sm:px-6 lg:px-0 py-3 sm:py-6">
      <Link
        href="/admin/actus"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
      >
        <ArrowLeft size={16} />
        {t.adminNewsPage.manageTitle}
      </Link>
      <h1 className="text-lg font-bold text-brand-secondary-text mb-4">{t.adminNewsPage.editArticle}</h1>

      {error && (
        <div className="mb-3">
          <FormErrorBanner message={t.adminNewsPage.saveError} />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-content-muted">{t.search.searching}</p>
      ) : article ? (
        <NewsForm
          initialValues={article}
          onSubmit={(values, cover) =>
            updateArticle({ id, values, cover }, { onSuccess: () => router.push('/admin/actus') })
          }
          isSubmitting={isPending}
          submitLabel={t.adminNewsPage.saveChanges}
        />
      ) : (
        <p className="text-sm text-content-muted">{t.newsPage.notFoundTitle}</p>
      )}
    </div>
  );
}
