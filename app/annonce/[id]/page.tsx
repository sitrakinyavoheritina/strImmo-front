'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPropertyById } from '@/lib/mock/properties';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';
import { Button } from '@/components/ui/button';

interface Stat {
  icon: string;
  value: string;
  label: string;
}

interface Amenity {
  icon: string;
  text: string;
  positive: boolean;
}

export default function AnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const [activePhoto, setActivePhoto] = useState(0);

  const property = getPropertyById(id);

  if (!property) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-content-main">{t.propertyDetail.notFoundTitle}</h1>
        <p className="text-sm text-content-muted mt-2">{t.propertyDetail.notFoundDesc}</p>
        <Link href="/" className="inline-block mt-4">
          <Button size="sm">{t.propertyDetail.backHome}</Button>
        </Link>
      </div>
    );
  }

  const categoryLabel = {
    maison: t.propertyDetail.categoryMaison,
    appartement: t.propertyDetail.categoryAppartement,
    terrain: t.propertyDetail.categoryTerrain,
    bureau: t.propertyDetail.categoryBureau,
  }[property.category];

  const isRental = property.type === 'location';

  const stats = [
    { icon: '📐', value: `${property.area} m²`, label: t.propertyDetail.areaLabel as string },
    property.bedrooms !== undefined
      ? {
          icon: '🛏️',
          value: String(property.bedrooms),
          label: t.propertyDetail.bedroomsLabel as string,
        }
      : null,
    property.bathrooms !== undefined
      ? {
          icon: '🚿',
          value: String(property.bathrooms),
          label: t.propertyDetail.bathroomsLabel as string,
        }
      : null,
    isRental && property.maxOccupants !== undefined
      ? {
          icon: '👥',
          value: `${property.maxOccupants} ${t.propertyDetail.maxOccupantsUnit}`,
          label: t.propertyDetail.maxOccupantsLabel as string,
        }
      : null,
  ].filter((s): s is Stat => s !== null);

  const amenities = [
    property.comfortable !== undefined
      ? {
          icon: '✨',
          text: (property.comfortable
            ? t.propertyDetail.comfortableYes
            : t.propertyDetail.comfortableNo) as string,
          positive: property.comfortable,
        }
      : null,
    property.carAccess !== undefined
      ? {
          icon: '🚗',
          text: (property.carAccess
            ? t.propertyDetail.carAccessYes
            : t.propertyDetail.carAccessNo) as string,
          positive: property.carAccess,
        }
      : null,
    property.motoAccess !== undefined
      ? {
          icon: '🏍️',
          text: (property.motoAccess
            ? t.propertyDetail.motoAccessYes
            : t.propertyDetail.motoAccessNo) as string,
          positive: property.motoAccess,
        }
      : null,
    isRental && property.rentalPeriod
      ? {
          icon: '📅',
          text: (property.rentalPeriod === 'mensuel'
            ? t.propertyDetail.rentalPeriodMensuel
            : t.propertyDetail.rentalPeriodJournalier) as string,
          positive: true,
        }
      : null,
    isRental && property.depositRequired !== undefined
      ? {
          icon: '💰',
          text: (property.depositRequired
            ? t.propertyDetail.depositRequired
            : t.propertyDetail.noDeposit) as string,
          positive: !property.depositRequired,
        }
      : null,
  ].filter((a): a is Amenity => a !== null);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 pb-24 md:pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-semibold text-content-muted hover:text-content-main mb-2 sm:mb-4"
      >
        ← {t.propertyDetail.back}
      </button>

      {/* Galerie photo */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-stroke-default">
        <Image
          src={property.photos[activePhoto]}
          alt={property.title}
          fill
          priority
          className="object-cover"
        />
        <span
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase ${
            property.type === 'location' ? 'bg-brand-primary' : 'bg-brand-secondary'
          }`}
        >
          {property.type === 'location' ? t.property.forRent : t.property.forSale}
        </span>
        <button
          type="button"
          onClick={() => toggleFavorite(property.id)}
          aria-label={isFavorite ? t.property.removeFromFavorites : t.property.addToFavorites}
          aria-pressed={isFavorite}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-card/90 flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {property.photos.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto scroll-touch">
          {property.photos.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActivePhoto(i)}
              aria-label={t.propertyDetail.viewPhoto}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                activePhoto === i ? 'border-brand-primary' : 'border-transparent'
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Titre, prix, localisation */}
      <div className="mt-3 sm:mt-6">
        <span className="text-[11px] sm:text-xs font-semibold text-brand-primary uppercase">
          {categoryLabel}
        </span>
        <h1 className="text-lg sm:text-2xl font-bold text-content-main mt-0.5">{property.title}</h1>
        <p className="text-content-muted text-xs sm:text-sm mt-1">📍 {property.location}</p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-3xl font-bold text-content-main">{property.price}</span>
          {property.priceUnit && (
            <span className="text-content-muted text-xs sm:text-sm">{property.priceUnit}</span>
          )}
        </div>
      </div>

      {/* Caractéristiques */}
      {stats.length > 0 && (
        <div className="mt-4 sm:mt-8">
          <h2 className="text-sm sm:text-lg font-bold text-content-main mb-2 sm:mb-4">
            {t.propertyDetail.detailsTitle}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-card border border-stroke-default rounded-xl p-3 text-center"
              >
                <div className="text-lg sm:text-xl">{stat.icon}</div>
                <div className="text-sm sm:text-base font-bold text-content-main mt-0.5">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-content-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commodités */}
      {amenities.length > 0 && (
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span
              key={amenity.text}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border ${
                amenity.positive
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                  : 'bg-surface-app text-content-muted border-stroke-default'
              }`}
            >
              {amenity.icon} {amenity.text}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {property.description && (
        <div className="mt-4 sm:mt-8">
          <h2 className="text-sm sm:text-lg font-bold text-content-main mb-2">
            {t.propertyDetail.descriptionTitle}
          </h2>
          <p className="text-sm text-content-main leading-relaxed">{property.description}</p>
        </div>
      )}

      {/* Contact — desktop */}
      {property.contactPhone && (
        <div className="mt-6 hidden md:block">
          <a href={`tel:${property.contactPhone}`}>
            <Button>{t.propertyDetail.contact} — {property.contactPhone}</Button>
          </a>
        </div>
      )}

      {/* Contact — barre fixe mobile */}
      {property.contactPhone && (
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card border-t border-stroke-default px-4 py-2.5 flex items-center justify-between gap-3"
          style={{ paddingBottom: 'calc(0.625rem + var(--safe-bottom))' }}
        >
          <div>
            <div className="font-bold text-content-main text-sm">{property.price}</div>
            {property.priceUnit && (
              <div className="text-[11px] text-content-muted">{property.priceUnit}</div>
            )}
          </div>
          <a href={`tel:${property.contactPhone}`}>
            <Button size="sm">{t.propertyDetail.contact}</Button>
          </a>
        </div>
      )}
    </div>
  );
}
