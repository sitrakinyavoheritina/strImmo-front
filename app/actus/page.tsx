'use client';

import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useNewsList } from '@/features/news/hooks/use-news';
import { RightRail } from '@/features/feed/components/right-rail';

function formatPublishedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

// Remplace l'ancien onglet "Cartes" (lien mort, aucune page dessus) — aligné sur l'onglet
// "Actualités" de l'app mobile de référence (Onina-mobile/src/features/news), pour lequel aucun
// backend n'existait nulle part dans le projet avant ce module.
//
// Fil façon Facebook : chaque article s'affiche en entier directement ici (couverture pleine
// largeur, titre, texte complet) — pas de vignette + résumé tronqué qu'il faudrait ouvrir sur une
// autre page pour lire, demandé explicitement. `/actus/[id]` reste disponible pour partager le
// lien d'un article précis, mais n'est plus le seul endroit où le lire en entier.
export default function ActusPage() {
  const { t, locale } = useTranslation();
  const { data: articles, isLoading } = useNewsList();

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto py-3 sm:py-6">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.newsPage.title}</h1>

        {isLoading ? (
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        ) : articles && articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm overflow-hidden"
              >
                {article.coverImageUrl && (
                  <div className="relative w-full aspect-[16/9] bg-stroke-default">
                    <Image src={article.coverImageUrl} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-content-muted">{formatPublishedDate(article.publishedAt, locale)}</p>
                  <h2 className="text-lg font-bold text-content-main mt-0.5">{article.title}</h2>
                  <p className="text-sm text-content-main mt-2">{article.summary}</p>
                  {article.content && (
                    <p className="text-sm text-content-main leading-relaxed mt-2 whitespace-pre-line">{article.content}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
            <Newspaper size={32} className="text-content-muted" />
            <p className="font-semibold text-content-main">{t.newsPage.emptyTitle}</p>
            <p className="text-sm text-content-muted">{t.newsPage.emptyDescription}</p>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
