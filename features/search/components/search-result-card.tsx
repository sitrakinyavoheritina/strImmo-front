import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { formatPrice } from '../utils/format-price';
import type { Property } from '../types/listing.types';

/** Carte pour une annonce des résultats de recherche / réponses de l'IA — format le plus compact
 * possible (utilisée uniquement dans le panneau "Recherche IA" inline, sous le chat : pas de place
 * pour un format aussi large que FeedPropertyCard/SearchResultCard classique). Pas de badges de
 * caractéristiques ni de type location/vente superposés à la photo, gardés pour la vue complète
 * (/recherche) seulement. */
export function SearchResultCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/annonce/${property.id}`}
      className="block bg-surface-card rounded-xl border border-stroke-default/80 overflow-hidden shadow-sm hover:shadow-md transition"
    >
      <div className="relative aspect-[4/3] bg-stroke-default">
        {property.mainPhotoUrl && (
          <Image src={property.mainPhotoUrl} alt={property.title} fill className="object-cover" />
        )}
      </div>

      <div className="p-1.5 space-y-0.5">
        <p className="text-xs font-bold text-content-main truncate">
          {formatPrice(property.price)}
          {property.propertyType === 'land' && (
            <span className="text-[10px] font-normal text-content-muted"> / m²</span>
          )}
        </p>
        <h3 className="text-[11px] font-semibold text-content-main line-clamp-1">{property.title}</h3>
        <p className="text-[10px] text-content-muted flex items-center gap-0.5 truncate">
          <MapPin size={10} className="shrink-0" /> <span className="truncate">{property.location}</span>
        </p>
      </div>
    </Link>
  );
}
