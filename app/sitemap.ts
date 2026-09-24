import type { MetadataRoute } from 'next';
import { fetchSitemapData } from '@/lib/seo/api';
import { getGeoPages } from '@/lib/seo/geo';
import { absoluteUrl } from '@/lib/seo/site';
import { TYPE_INFO, propertyPath, type SeoPropertyType } from '@/lib/seo/slug';

// Régénéré au plus toutes les heures (l'API est déjà mise en cache 5 minutes côté fetch).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ properties }, geoPages] = await Promise.all([fetchSitemapData(), getGeoPages()]);

  // Une catégorie n'entre dans le sitemap que si elle a au moins une annonce (pas de page vide).
  const typesWithListings = new Set<SeoPropertyType>(properties.map((item) => item.propertyType));

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    ...(Object.keys(TYPE_INFO) as SeoPropertyType[])
      .filter((type) => typesWithListings.has(type))
      .map((type) => ({
        url: absoluteUrl(`/${TYPE_INFO[type].slug}`),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      })),
    ...geoPages.map((page) => ({
      url: absoluteUrl(`/${TYPE_INFO[page.propertyType].slug}/${page.slug}`),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...properties.map((item) => ({
      url: absoluteUrl(propertyPath(item)),
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    { url: absoluteUrl('/politique-de-confidentialite'), changeFrequency: 'yearly', priority: 0.2 },
  ];
  return entries;
}
