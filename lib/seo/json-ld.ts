import type { Property } from '@/features/search/types/listing.types';
import { absoluteUrl } from './site';
import { propertyPath } from './slug';

// Données structurées d'une annonce — uniquement ce qui est réellement affiché sur la page (prix,
// lieu, chambres, surface, photos). Aucune coordonnée du vendeur. `RealEstateListing` + une
// `Offer` (prix en ariary, MGA) ; le bien lui-même (`about`) reçoit le type schema.org le plus
// proche : House/Apartment, `Place` pour un terrain (schema.org n'a pas de type "terrain" dédié).
export function propertyJsonLd(property: Property): Record<string, unknown> {
  const url = absoluteUrl(propertyPath(property));
  const address = {
    '@type': 'PostalAddress',
    addressLocality: property.location,
    ...(property.communeName ? { addressRegion: property.communeName } : {}),
    addressCountry: 'MG',
  };

  const about: Record<string, unknown> = {
    '@type':
      property.propertyType === 'apartment' ? 'Apartment' : property.propertyType === 'land' ? 'Place' : 'House',
    name: property.title,
    address,
  };
  if (property.propertyType === 'house') about.numberOfBedrooms = property.bedrooms;
  if (property.propertyType !== 'house') {
    about.floorSize = { '@type': 'QuantitativeValue', value: property.surfaceM2, unitCode: 'MTK' };
  }
  if (property.latitude != null && property.longitude != null) {
    about.geo = { '@type': 'GeoCoordinates', latitude: property.latitude, longitude: property.longitude };
  }

  const unitCode =
    property.propertyType === 'land' && property.priceType === 'per_m2' ? 'MTK' : property.kind === 'rent' ? 'MON' : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url,
    datePosted: property.createdAt,
    image: property.photoUrls?.length ? property.photoUrls : property.mainPhotoUrl ? [property.mainPhotoUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MGA',
      price: property.price,
      ...(unitCode
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: property.price,
              priceCurrency: 'MGA',
              unitCode,
            },
          }
        : {}),
      availability: 'https://schema.org/InStock',
      url,
    },
    about,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** À placer dans un <script type="application/ld+json"> — `<` échappé pour qu'un texte d'annonce
 * ne puisse jamais fermer la balise script. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
