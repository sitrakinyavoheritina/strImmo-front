'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useCommunes } from '@/features/listings/hooks/use-communes';
import { useMyPropertyRequests, usePublicPropertyRequests } from '@/features/property-requests/hooks/use-property-requests';
import { MyRequestCard } from '@/features/property-requests/components/my-request-card';
import { PublicBoardCard } from '@/features/property-requests/components/public-board-card';
import { NewsFeed } from '@/features/news/components/news-feed';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';

type Tab = 'mine' | 'board' | 'news';

// Écran "Demandes" — réutilise l'emplacement de navigation de l'ancien "Actus" (voir
// nav-items.ts), avec trois sous-onglets : le tableau public consultable par tous (affiché par
// défaut : c'est là qu'il y a du contenu à voir, contrairement à "Mes demandes" qui démarre vide
// pour la plupart des comptes), mes propres demandes, et le fil d'actualités existant (NewsFeed,
// inchangé — juste déplacé ici en plus de /actus, qui reste accessible directement).
export default function DemandesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const [tab, setTab] = useState<Tab>('board');

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  const { data: myRequests, isLoading: isLoadingMine } = useMyPropertyRequests(isAuthenticated && tab === 'mine');
  const { data: publicRequests, isLoading: isLoadingBoard } = usePublicPropertyRequests({});
  useCommunes(); // préchauffe le cache pour /demandes/nouvelle, ouvert juste après depuis ici

  if (!isAuthenticated) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'board', label: t.propertyRequestsPage.tabPublicBoard },
    { key: 'mine', label: t.propertyRequestsPage.tabMine },
    { key: 'news', label: t.propertyRequestsPage.tabNews },
  ];

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto py-3 sm:py-6">
        <div className="flex items-center gap-1.5 mb-4">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full text-[0.85rem] font-bold transition ${
                tab === key ? 'bg-brand-secondary text-white' : 'text-content-muted hover:bg-surface-app'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'board' && (
          <>
            <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-1">{t.propertyRequestsPage.publicBoardTitle}</h1>
            <p className="text-[0.85rem] text-content-muted mb-3">{t.propertyRequestsPage.publicBoardSubtitle}</p>
            {isLoadingBoard ? (
              <p className="text-sm text-content-muted">{t.search.searching}</p>
            ) : publicRequests && publicRequests.length > 0 ? (
              <div className="space-y-2">
                {publicRequests.map((request) => (
                  <PublicBoardCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted py-12 text-center">{t.propertyRequestsPage.publicBoardEmpty}</p>
            )}
          </>
        )}

        {tab === 'mine' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.propertyRequestsPage.mineTitle}</h1>
              <Link href="/demandes/nouvelle">
                <Button type="button" size="sm">
                  {t.propertyRequestsPage.createButton}
                </Button>
              </Link>
            </div>
            {isLoadingMine ? (
              <p className="text-sm text-content-muted">{t.search.searching}</p>
            ) : myRequests && myRequests.length > 0 ? (
              <div className="space-y-2">
                {myRequests.map((request) => (
                  <MyRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
                <Search size={32} className="text-content-muted" />
                <p className="font-semibold text-content-main">{t.propertyRequestsPage.mineEmptyTitle}</p>
                <p className="text-sm text-content-muted px-4">{t.propertyRequestsPage.mineEmptyDescription}</p>
                <Link href="/demandes/nouvelle">
                  <Button type="button" size="sm">
                    {t.propertyRequestsPage.createButton}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {tab === 'news' && (
          <>
            <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.newsPage.title}</h1>
            <NewsFeed />
          </>
        )}
      </div>
      <RightRail />
    </div>
  );
}
