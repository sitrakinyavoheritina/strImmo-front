import React from 'react';

export interface PropertyCardProps {
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
  title,
  price,
  priceUnit,
  location,
  type,
  bedrooms,
  bathrooms,
  area,
}) => {
  return (
    <div className="bg-surface-card rounded-2xl border border-stroke-default/80 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="h-48 bg-slate-200 relative flex items-center justify-center text-slate-400 font-medium text-xs">
        [ Photo Propriété ]
        <span
          className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
            type === 'location' ? 'bg-brand-primary' : 'bg-brand-secondary'
          }`}
        >
          {type}
        </span>
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
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-content-muted">📍 {location}</p>

        <div className="flex gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
          {bedrooms !== undefined && <span>🛏️ {bedrooms} ch.</span>}
          {bathrooms !== undefined && <span>🚿 {bathrooms} sdb.</span>}
          <span>📐 {area} m²</span>
        </div>
      </div>
    </div>
  );
};