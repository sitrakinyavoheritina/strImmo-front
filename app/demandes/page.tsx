'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useCommunes } from '@/features/listings/hooks/use-communes';
import type { PublicPropertyRequestFilters } from '@/features/property-requests/types/property-request.types';
import { useMyPropertyRequests, usePublicPropertyRequests } from '@/features/property-requests/hooks/use-property-requests';
import { MyRequestCard } from '@/features/property-requests/components/my-request-card';
import { PublicBoardCard } from '@/features/property-requests/components/public-board-card';
import { BoardFilterButton } from '@/features/property-requests/components/board-filter-button';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';

type Tab = 'mine' | 'board';

// Écran "Demandes" — réutilise l'emplacement de navigation de l'ancien "Actus" (voir
// nav-items.ts), avec deux sous-onglets : le tableau public consultable par tous (affiché par
// défaut : c'est là qu'il y a du contenu à voir, contrairement à "Mes demandes" qui démarre vide
// pour la plupart des comptes) et mes propres demandes. Le fil d'actualités (NewsFeed) avait été
// ajouté ici en plus de /actus — retiré de cette page (demandé explicitement), /actus reste le
// seul accès.
export default function DemandesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const [tab, setTab] = useState<Tab>('board');
  // Filtre du tableau public seulement (kind/propertyType, voir strImmo/src/property-requests/
  // dto/list-public-property-requests-query.dto.ts) — commune volontairement pas encore proposé
  // ici, pour garder ce premier filtre simple.
  const [boardFilters, setBoardFilters] = useState<PublicPropertyRequestFilters>({});

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  const { data: myRequests, isLoading: isLoadingMine } = useMyPropertyRequests(isAuthenticated && tab === 'mine');
  const { data: publicRequests, isLoading: isLoadingBoard } = usePublicPropertyRequests(boardFilters);
  useCommunes(); // préchauffe le cache pour /demandes/nouvelle, ouvert juste après depuis ici

  // Distingue les auteurs du tableau public entre eux ("Membre anonyme", "Membre anonyme 2"...)
  // sans jamais révéler qui ils sont : `userId` n'est utilisé que comme clé de regroupement,
  // jamais affiché. Numérotation par ordre d'apparition dans la liste courante (triée par date de
  // création côté serveur) — stable tant que la liste elle-même ne change pas, pas une identité
  // persistante d'une session à l'autre.
  const authorLabels = useMemo(() => {
    const labels = new Map<string, string>();
    let count = 0;
    for (const request of publicRequests ?? []) {
      if (labels.has(request.userId)) continue;
      count += 1;
      labels.set(request.userId, count === 1 ? t.propertyRequestsPage.anonymousAuthor : `${t.propertyRequestsPage.anonymousAuthor} ${count}`);
    }
    return labels;
  }, [publicRequests, t]);

  if (!isAuthenticated) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'board', label: t.propertyRequestsPage.tabPublicBoard },
    { key: 'mine', label: t.propertyRequestsPage.tabMine },
  ];

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto py-3 sm:py-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* `overflow-x-auto` + `whitespace-nowrap` : filet de sécurité si un libellé venait à
              être plus long (traduction, futur onglet) plutôt qu'un retour à la ligne dans le
              bouton (rendu précédent, peu lisible) — jamais nécessaire en pratique à la largeur
              d'un téléphone, mais ne casse rien si l'espace vient à manquer. */}
          <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[0.85rem] font-bold transition ${
                  tab === key ? 'bg-brand-secondary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Bouton "Créer une demande" toujours visible, quel que soit l'onglet — auparavant
              seulement présent sur l'onglet "Mes demandes", ce qui obligeait à changer d'onglet
              avant de pouvoir en créer une depuis le tableau public. */}
          <Link href="/demandes/nouvelle" className="shrink-0">
            <Button type="button" size="sm">
              <Plus size={20} className="sm:hidden" />
              <span className="hidden sm:inline">{t.propertyRequestsPage.createButton}</span>
            </Button>
          </Link>
        </div>

        {tab === 'board' && (
          <>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-1">{t.propertyRequestsPage.publicBoardTitle}</h1>
                <p className="text-[0.85rem] text-content-muted">{t.propertyRequestsPage.publicBoardSubtitle}</p>
              </div>
              <BoardFilterButton filters={boardFilters} onChange={setBoardFilters} />
            </div>

            {isLoadingBoard ? (
              <p className="text-sm text-content-muted">{t.search.searching}</p>
            ) : publicRequests && publicRequests.length > 0 ? (
              <div className="space-y-2">
                {publicRequests.map((request) => (
                  <PublicBoardCard
                    key={request.id}
                    request={request}
                    authorLabel={authorLabels.get(request.userId) ?? t.propertyRequestsPage.anonymousAuthor}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted py-12 text-center">{t.propertyRequestsPage.publicBoardEmpty}</p>
            )}
          </>
        )}

        {tab === 'mine' && (
          <>
            <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-3">{t.propertyRequestsPage.mineTitle}</h1>
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
                <ClipboardList size={32} className="text-content-muted" />
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
      </div>
      <RightRail />
    </div>
  );
}
