'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useNewsList } from '@/features/news/hooks/use-news';
import { useDeleteNews } from '@/features/news/hooks/use-news-admin';
import { Button } from '@/components/ui/button';

function formatPublishedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Gestion des actus (admin uniquement) — liste, avec modifier/supprimer par article et un lien
 * vers la création. Pas d'onglets statut/publication : contrairement aux annonces, un article
 * n'a pas de cycle de modération, il est publié dès sa création. */
export default function AdminActusPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: articles, isLoading } = useNewsList();
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteNews();

  if (!isAdminUser) return null;

  function handleDelete(id: string) {
    deleteArticle(id, { onSuccess: () => setPendingDeleteId(null) });
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-0 py-3 sm:py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminNewsPage.manageTitle}</h1>
        <Link href="/admin/actus/nouveau">
          <Button size="sm">
            <Plus size={16} />
            {t.adminNewsPage.newArticle}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-content-muted">{t.search.searching}</p>
      ) : articles && articles.length > 0 ? (
        <div className="space-y-2">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-2.5"
            >
              <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-stroke-default">
                {article.coverImageUrl && <Image src={article.coverImageUrl} alt="" fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-content-main truncate">{article.title}</p>
                <p className="text-xs text-content-muted">{formatPublishedDate(article.publishedAt, locale)}</p>
              </div>
              <Link
                href={`/admin/actus/${article.id}`}
                aria-label={t.adminNewsPage.editArticle}
                className="w-8 h-8 rounded-full flex items-center justify-center text-content-muted hover:text-brand-primary hover:bg-surface-app transition shrink-0"
              >
                <Pencil size={15} />
              </Link>
              {pendingDeleteId === article.id ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(article.id)}
                    disabled={isDeleting}
                    className="text-danger disabled:opacity-50"
                  >
                    {t.adminNewsPage.confirmDelete}
                  </button>
                  <button type="button" onClick={() => setPendingDeleteId(null)} className="text-content-muted">
                    {t.adminNewsPage.cancelDelete}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(article.id)}
                  aria-label={t.adminNewsPage.deleteArticle}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-content-muted hover:text-danger hover:bg-surface-app transition shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
          <Newspaper size={32} className="text-content-muted" />
          <p className="font-semibold text-content-main">{t.newsPage.emptyTitle}</p>
          <Link href="/admin/actus/nouveau" className="inline-block mt-1">
            <Button size="sm">{t.adminNewsPage.newArticle}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
