'use client';

import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { CategoryGrid } from './category-grid';
import { RecentListingsWidget } from './recent-listings-widget';
import { NearbyPropertiesMapWidget } from './nearby-properties-map-widget';

/** Colonne de droite du fil d'accueil, visible à partir de `lg:` — catégories populaires,
 *  annonces récentes, carte des annonces à proximité : rien de tout ça n'a de sens pour un compte
 *  admin/superadmin (il ne parcourt pas les annonces comme un acheteur), donc rien n'est rendu
 *  pour lui, quelle que soit la page où ce composant est monté — demandé explicitement. */
export function RightRail() {
  const user = useAuthStore((state) => state.user);
  if (isAdmin(user)) return null;

  return (
    <aside className="hidden lg:flex w-96 shrink-0 self-start sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto flex-col gap-6 py-6 pl-6 pr-4">
      <CategoryGrid />
      <RecentListingsWidget />
      <NearbyPropertiesMapWidget />
    </aside>
  );
}
