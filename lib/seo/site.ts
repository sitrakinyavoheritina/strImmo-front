// URL publique du site (canonical, Open Graph, sitemap) — surchargeable par variable d'env pour un
// environnement de test, `https://onina.mg` par défaut.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onina.mg').replace(/\/$/, '');
export const SITE_NAME = 'Onina';
export const SITE_TAGLINE = 'Trouvez. Fondez. Habitez.';
export const SITE_TITLE = 'Onina | Immobilier à Madagascar – Maisons, appartements, villas et terrains';
export const SITE_DESCRIPTION =
  'Trouvez une maison, un appartement, une villa ou un terrain à vendre ou à louer à Madagascar avec Onina, la plateforme immobilière qui met en relation propriétaires, acheteurs et locataires.';

/** URL absolue à partir d'un chemin du site ("/maison" → "https://onina.mg/maison"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
