'use client';

import React from 'react';
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
}) => {
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <div className="bg-surface-card rounded-2xl border border-stroke-default/80 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="h-48 bg-stroke-default relative flex items-center justify-center text-content-muted font-medium text-xs">
        {t.property.photoPlaceholder}
        <span
          className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
            type === 'location' ? 'bg-brand-primary' : 'bg-brand-secondary'
          }`}
        >
          {type === 'location' ? t.property.forRent : t.property.forSale}
        </span>
        <button
          type="button"
          onClick={() => toggleFavorite(id)}
          aria-label={isFavorite ? t.property.removeFromFavorites : t.property.addToFavorites}
          aria-pressed={isFavorite}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-card/90 flex items-center justify-center shadow-sm hover:scale-105 transition"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="p-4 space-y-2">
        <span className="text-lg font-bold text-content-main">
          {price}{' '}
          {priceUnit && (
            <span className="text-xs font-normal text-content-muted">
              {priceUnit}
            </span>
          )}
        </span>
        <h3 className="text-sm font-semibold text-content-main line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-content-muted">📍 {location}</p>

        <div className="flex gap-4 pt-2 border-t border-stroke-default text-xs text-content-muted">
          {bedrooms !== undefined && <span>🛏️ {bedrooms} {t.property.bedrooms}</span>}
          {bathrooms !== undefined && <span>🚿 {bathrooms} {t.property.bathrooms}</span>}
          <span>📐 {area} m²</span>
        </div>
      </div>
    </div>
  );
};
