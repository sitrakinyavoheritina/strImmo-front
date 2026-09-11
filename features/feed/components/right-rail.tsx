import { CategoryGrid } from './category-grid';
import { RecentListingsWidget } from './recent-listings-widget';
import { FavoritesMapWidget } from './favorites-map-widget';

/** Colonne de droite du fil d'accueil, visible à partir de `lg:`. */
export function RightRail() {
  return (
    <aside className="hidden lg:flex w-96 shrink-0 self-start sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto flex-col gap-6 py-6 pl-6 pr-4">
      <CategoryGrid />
      <RecentListingsWidget />
      <FavoritesMapWidget />
    </aside>
  );
}
