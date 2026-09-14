import { FeedPropertyCard } from './feed-property-card';
import { FeedPropertyRow } from './feed-property-row';
import type { Property } from '@/features/search/types/listing.types';

/** `variant="card"` (défaut) : grille de cartes (photo pleine largeur) — utilisée partout sauf
 *  l'accueil, qui teste `variant="list"` (lignes horizontales façon Mes Biens/Favoris). Revenir en
 *  arrière : retirer `variant="list"` là où il est passé, cette prop par défaut suffit. */
export function FeedList({
  properties,
  variant = 'card',
}: {
  properties: Property[];
  variant?: 'card' | 'list';
}) {
  if (variant === 'list') {
    // 2 ou 3 par ligne sur desktop, demandé explicitement — `auto-fill`/`minmax` (comme la grille
    // de cartes plus bas) plutôt que des points de rupture fixes (`sm:`/`lg:`) : le nombre de
    // colonnes suit la largeur RÉELLEMENT disponible pour ce bloc (qui n'est pas la largeur de
    // l'écran — il y a la sidebar et le rail de droite en desktop), 2 colonnes tant que la place
    // manque pour une 3ᵉ plutôt que de la forcer et écraser le contenu de chaque ligne (chevauchement
    // des badges, prix coupé en plusieurs lignes — constaté avec `lg:grid-cols-3` fixe).
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {properties.map((property) => (
          <FeedPropertyRow key={property.id} property={property} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {properties.map((property) => (
        <FeedPropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
