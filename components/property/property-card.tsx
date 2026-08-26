'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';
import { useTranslation } from '@/lib/i18n/use-translation';

export interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  location: string;
  type: 'location' | 'vente';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  photos?: string[];
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  priceUnit,
  location,
  type,
  bedrooms,
  bathrooms,
  area,
  photos,
}) => {
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const cover = photos?.[0];

  return (
    <div className="relative bg-surface-card rounded-xl sm:rounded-2xl border border-stroke-default/80 overflow-hidden shadow-sm hover:shadow-md transition">
      <Link href={`/annonce/${id}`} className="block">
        <div className="h-24 sm:h-48 bg-stroke-default relative flex items-center justify-center text-content-muted font-medium text-[10px] sm:text-xs">
          {cover ? (
            <Image src={cover} alt={title} fill className="object-cover" />
          ) : (
            t.property.photoPlaceholder
          )}
          <span
            className={`absolute top-1.5 left-1.5 sm:top-3 sm:left-3 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded sm:rounded-md uppercase ${
              type === 'location' ? 'bg-brand-primary' : 'bg-brand-secondary'
            }`}
          >
            {type === 'location' ? t.property.forRent : t.property.forSale}
          </span>
        </div>

        <div className="p-2 sm:p-4 space-y-0.5 sm:space-y-2">
          <span className="text-sm sm:text-lg font-bold text-content-main">
            {price}{' '}
            {priceUnit && (
              <span className="text-[10px] sm:text-xs font-normal text-content-muted">
                {priceUnit}
              </span>
            )}
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-content-main line-clamp-1">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-content-muted">📍 {location}</p>

          <div className="flex gap-2 sm:gap-4 pt-1 sm:pt-2 border-t border-stroke-default text-[10px] sm:text-xs text-content-muted">
            {bedrooms !== undefined && <span>🛏️ {bedrooms} {t.property.bedrooms}</span>}
            {bathrooms !== undefined && <span>🚿 {bathrooms} {t.property.bathrooms}</span>}
            <span>📐 {area} m²</span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleFavorite(id)}
        aria-label={isFavorite ? t.property.removeFromFavorites : t.property.addToFavorites}
        aria-pressed={isFavorite}
        className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-surface-card/90 flex items-center justify-center text-xs sm:text-base shadow-sm hover:scale-105 active:scale-95 transition"
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};
