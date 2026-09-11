'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { CardOptionsMenu } from './card-options-menu';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatPrice } from '@/features/search/utils/format-price';
import type { Property } from '@/features/search/types/listing.types';

const PUBLISHER_LABEL_KEY = {
  owner: 'publisherOwner',
  agent: 'publisherAgent',
  agency: 'publisherAgency',
} as const;

function formatCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);
}

// Carte façon post social pour une annonce, utilisée dans le fil d'accueil — données réelles
// (backend). Le badge en haut de la photo indique le type de compte (Propriétaire/Agence/
// Intermédiaire) quand connu — absent si le backend n'a pas renvoyé cette info (ex. annonce sans
// publieur chargé). Auteur + actions (favoris/commenter/menu) sont regroupés dans une seule ligne
// en bas de carte, plutôt que d'avoir un en-tête séparé.
export function FeedPropertyCard({ property }: { property: Property }) {
  const { t } = useTranslation();
  const cover = property.mainPhotoUrl;

  return (
    <article className="bg-surface-card rounded-2xl border border-stroke-default/80 shadow-sm hover:shadow-md transition">
      <Link href={`/annonce/${property.id}`} className="block relative aspect-[3/2] bg-stroke-default rounded-t-2xl overflow-hidden">
        {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
        <span
          className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
            property.kind === 'rent' ? 'bg-brand-primary' : 'bg-brand-secondary'
          }`}
        >
          {property.kind === 'rent' ? t.property.forRent : t.property.forSale}
        </span>
        {property.publisherType && (
          <span className="absolute top-3 right-3 bg-surface-card/95 text-content-main text-[10px] font-bold px-2 py-1 rounded-md uppercase">
            {t.search[PUBLISHER_LABEL_KEY[property.publisherType]]}
          </span>
        )}
        <span className="absolute bottom-3 right-3 bg-surface-card/95 text-content-main text-xs font-bold px-2 py-1 rounded-md">
          {formatPrice(property.price)}
          {property.propertyType === 'land' && <span className="font-normal text-content-muted"> / m²</span>}
        </span>
      </Link>

      <div className="px-3 py-2 space-y-0.5">
        <p className="text-xs text-content-muted flex items-center gap-1">
          <MapPin size={12} />
          {property.location}
        </p>
        <h3 className="text-sm font-semibold text-content-main line-clamp-1">{property.title}</h3>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-stroke-default">
        {property.authorName ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar name={property.authorName} imageUrl={property.authorAvatarUrl} size={22} />
            <span className="text-xs font-semibold text-content-main truncate">@{property.authorName}</span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3 text-xs font-medium text-content-muted shrink-0">
          <span className="flex items-center gap-1">
            <Heart size={15} /> {formatCount(property.favoritesCount ?? 0)}
          </span>
          <MessageCircle size={15} />
          <CardOptionsMenu property={property} />
        </div>
      </div>
    </article>
  );
}
