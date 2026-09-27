'use client';

import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useNewsList } from '../hooks/use-news';

function formatPublishedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Fil d'articles façon Facebook (couverture pleine largeur, texte complet, pas de résumé tronqué
 *  à ouvrir ailleurs) — extrait de app/actus/page.tsx pour être réutilisé comme sous-onglet
 *  "Actualités" de l'écran /demandes (voir app/demandes/page.tsx), sans dupliquer le rendu. */
export function NewsFeed() {
  const { t, locale } = useTranslation();
  const { data: articles, isLoading } = useNewsList();

  if (isLoading) return <p className="text-sm text-content-muted">{t.search.searching}</p>;

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
        <Newspaper size={32} className="text-content-muted" />
        <p className="font-semibold text-content-main">{t.newsPage.emptyTitle}</p>
        <p className="text-sm text-content-muted">{t.newsPage.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <article key={article.id} className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm overflow-hidden">
          {article.coverImageUrl && (
            <div className="relative w-full aspect-[16/9] bg-stroke-default">
              <Image src={article.coverImageUrl} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="p-4">
            <p className="text-[0.85rem] text-content-muted">{formatPublishedDate(article.publishedAt, locale)}</p>
            <h2 className="text-lg font-bold text-content-main mt-0.5">{article.title}</h2>
            <p className="text-sm text-content-main mt-2">{article.summary}</p>
            {article.content && (
              <p className="text-sm text-content-main leading-relaxed mt-2 whitespace-pre-line">{article.content}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
