'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { NewsFeed } from '@/features/news/components/news-feed';
import { RightRail } from '@/features/feed/components/right-rail';

// Fil d'actualités — accessible désormais depuis /demandes (sous-onglet "Actualités", voir
// app/demandes/page.tsx), cette page reste ouverte pour un lien direct déjà partagé.
export default function ActusPage() {
  const { t } = useTranslation();

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto py-3 sm:py-6">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.newsPage.title}</h1>
        <NewsFeed />
      </div>
      <RightRail />
    </div>
  );
}
