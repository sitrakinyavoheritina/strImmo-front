import type { Property } from '@/features/search/types/listing.types';

// Retire accents et caractères spéciaux : "Ambatobé, 3ᵉ arrondissement" → "ambatobe-3e-arrondissement".
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ᵉ/g, 'e')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

const UUID_TAIL = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** L'identifiant réel est toujours les 36 derniers caractères du segment d'URL : le slug devant
 * est purement décoratif (SEO), donc modifiable (titre changé) sans casser les anciens liens, et
 * un lien nu `/annonce/<uuid>` reste valide. */
export function extractPropertyId(param: string): string | null {
  const match = decodeURIComponent(param).match(UUID_TAIL);
  return match ? match[1].toLowerCase() : null;
}

export const TYPE_INFO = {
  house: { slug: 'maison', singular: 'Maison', plural: 'Maisons', label: 'maison' },
  apartment: { slug: 'appartement', singular: 'Appartement', plural: 'Appartements', label: 'appartement' },
  villa: { slug: 'villa', singular: 'Villa', plural: 'Villas', label: 'villa' },
  land: { slug: 'terrain', singular: 'Terrain', plural: 'Terrains', label: 'terrain' },
} as const;

export type SeoPropertyType = keyof typeof TYPE_INFO;

export function typeFromSlug(slug: string): SeoPropertyType | null {
  const entry = (Object.entries(TYPE_INFO) as [SeoPropertyType, (typeof TYPE_INFO)[SeoPropertyType]][]).find(
    ([, info]) => info.slug === slug
  );
  return entry ? entry[0] : null;
}

type SlugSource = Pick<Property, 'id' | 'propertyType' | 'kind' | 'location'>;

/** Segment d'URL canonique : "maison-a-vendre-ambohibao-<uuid>". */
export function propertyPathSegment(property: SlugSource): string {
  const type = TYPE_INFO[property.propertyType].slug;
  const kind = property.kind === 'rent' ? 'a-louer' : 'a-vendre';
  const place = slugify(property.location ?? '');
  return [type, kind, place, property.id].filter(Boolean).join('-');
}

export function propertyPath(property: SlugSource): string {
  return `/annonce/${propertyPathSegment(property)}`;
}
