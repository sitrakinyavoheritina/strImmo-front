import { FeedPropertyCard } from './feed-property-card';
import type { Property } from '@/features/search/types/listing.types';

/** Grille du fil : le nombre de colonnes s'adapte à la largeur disponible (pas de valeur fixe). */
export function FeedList({ properties }: { properties: Property[] }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {properties.map((property) => (
        <FeedPropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
