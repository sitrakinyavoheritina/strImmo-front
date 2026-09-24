import { mapApiPropertyToProperty } from '@/features/search/services/property-mapper';
import type { ApiProperty } from '@/features/search/services/property-api';
import type { Property, PropertyFilters } from '@/features/search/types/listing.types';

// Lecture de l'API depuis le SERVEUR Next (rendu SEO) — sans le client axios du navigateur (qui lit
// le jeton dans le store Zustand). Toujours anonyme : le backend ne renvoie donc jamais de numéro
// de téléphone ici (voir PropertiesService.toPublicView), et on les retire quand même par
// précaution avant tout passage à un composant client (elles se retrouveraient dans le HTML).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const REVALIDATE_SECONDS = 300;
// Une API lente ou figée ne doit jamais bloquer le rendu d'une page : au-delà, on abandonne (le rendu
// client prend le relais pour une annonce, la page s'affiche sans la liste sinon).
const FETCH_TIMEOUT_MS = 4000;

async function getJson<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T | null> {
  const url = new URL(path, API_URL);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function stripContact(property: Property): Property {
  return { ...property, contactPhone: undefined, phone2: undefined };
}

export type PropertyResult =
  | { status: 'ok'; property: Property }
  | { status: 'not_found' }
  | { status: 'error' };

// Distingue une annonce réellement inexistante (404 → vraie page 404 pour Google) d'une panne
// passagère de l'API (le rendu client prend alors le relais, sans afficher de faux 404).
export async function fetchProperty(id: string): Promise<PropertyResult> {
  try {
    const response = await fetch(new URL(`/properties/${id}`, API_URL), {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (response.status === 404 || response.status === 400) return { status: 'not_found' };
    if (!response.ok) return { status: 'error' };
    const data = (await response.json()) as ApiProperty;
    return { status: 'ok', property: stripContact(mapApiPropertyToProperty(data)) };
  } catch {
    return { status: 'error' };
  }
}

export async function fetchProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const data = await getJson<ApiProperty[]>('/properties', filters as Record<string, string | number | boolean | undefined>);
  return (data ?? []).map((item) => stripContact(mapApiPropertyToProperty(item)));
}

export type SitemapProperty = { id: string; title: string; propertyType: Property['propertyType']; kind: Property['kind']; location: string; updatedAt: string };
export type GeoCount = { communeId: string; communeName: string; district: string | null; propertyType: Property['propertyType']; count: number };

export async function fetchSitemapData(): Promise<{ properties: SitemapProperty[]; geo: GeoCount[] }> {
  const data = await getJson<{ properties: SitemapProperty[]; geo: GeoCount[] }>('/properties/sitemap');
  return data ?? { properties: [], geo: [] };
}
