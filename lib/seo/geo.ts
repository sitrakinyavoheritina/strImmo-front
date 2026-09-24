import { slugify, type SeoPropertyType } from './slug';
import { fetchSitemapData, type GeoCount } from './api';

// Une page géographique n'existe que si elle a assez de contenu réel : en dessous, elle serait
// "mince" (peu utile, risque de dévaluation par Google) — 404 et absente du sitemap.
// Seuil configurable (SEO_MIN_LISTINGS_FOR_GEO_PAGE) pour l'ajuster au volume réel sans redéployer du code.
export const MIN_LISTINGS_FOR_GEO_PAGE = Number(process.env.SEO_MIN_LISTINGS_FOR_GEO_PAGE ?? 3);

export type GeoPage = { slug: string; communeId: string; label: string; propertyType: SeoPropertyType; count: number };

/** Pages géographiques valides : une par (commune, type de bien) ayant ≥ MIN annonces approuvées.
 * Le slug est le nom de la commune ; si deux communes portent le même nom, les 8 premiers
 * caractères de l'identifiant sont ajoutés (le référentiel a des doublons de noms entre districts). */
export async function getGeoPages(): Promise<GeoPage[]> {
  const { geo } = await fetchSitemapData();
  const eligible = geo.filter((row: GeoCount) => row.count >= MIN_LISTINGS_FOR_GEO_PAGE);
  const nameCounts = new Map<string, number>();
  eligible.forEach((row) => {
    const key = `${row.propertyType}:${slugify(row.communeName)}`;
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  });
  return eligible.map((row) => {
    const base = slugify(row.communeName);
    const duplicated = (nameCounts.get(`${row.propertyType}:${base}`) ?? 0) > 1;
    return {
      slug: duplicated ? `${base}-${row.communeId.slice(0, 8)}` : base,
      communeId: row.communeId,
      label: row.district ? `${row.communeName}, ${row.district}` : row.communeName,
      propertyType: row.propertyType,
      count: row.count,
    };
  });
}
