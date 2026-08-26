import Link from 'next/link';
import { PropertyCard } from './property-card';
import type { Property } from '@/lib/mock/properties';

interface PropertyRailProps {
  title: string;
  description?: string;
  properties: Property[];
  viewAllHref?: string;
  viewAllLabel?: string;
  tone?: 'default' | 'tinted';
}

/**
 * Renders a property collection two different ways depending on viewport:
 * a horizontally swipeable, edge-to-edge rail on mobile (à la Stories), and
 * a width-driven auto-fit grid on desktop — the card count per row is never
 * hardcoded, it's whatever `minmax(280px, 1fr)` fits.
 */
export function PropertyRail({
  title,
  description,
  properties,
  viewAllHref,
  viewAllLabel,
  tone = 'default',
}: PropertyRailProps) {
  return (
    <section className={tone === 'tinted' ? 'bg-surface-card border-y border-stroke-default/80' : ''}>
      <div className="max-w-7xl mx-auto py-4 sm:py-16">
        <div className="flex justify-between items-end mb-2.5 sm:mb-8 px-3 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-base sm:text-2xl font-bold text-content-main">{title}</h2>
            {description && (
              <p className="text-content-muted text-[11px] sm:text-sm mt-0.5 sm:mt-1">
                {description}
              </p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover shrink-0 ml-3"
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>

        {/* Mobile : rail horizontal défilable, bord à bord, cartes compactes */}
        <div className="sm:hidden flex gap-2.5 overflow-x-auto scroll-touch snap-x snap-mandatory px-3 pb-1">
          {properties.map((property) => (
            <div key={property.id} className="w-[44vw] max-w-[190px] min-w-[150px] shrink-0 snap-start">
              <PropertyCard {...property} />
            </div>
          ))}
        </div>

        {/* Desktop / tablette : grille qui s'adapte à la largeur disponible */}
        <div
          className="hidden sm:grid gap-6 px-4 sm:px-6 lg:px-8"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
}
