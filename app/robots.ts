import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site';

// Pages publiques crawlables ; tout l'espace privé (compte, messagerie, administration,
// authentification, formulaires de publication) est exclu. `/recherche` (une URL par combinaison
// de filtres) l'est aussi : les pages catégories/communes (`/maison`, `/maison/<commune>`) sont les
// points d'entrée SEO, pas les filtres. Ces mêmes pages portent en plus `noindex` (voir leurs
// layout.tsx) : ceinture et bretelles, `Disallow` seul n'empêche pas une URL liée d'être listée.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/connexion',
          '/inscription',
          '/mot-de-passe-oublie',
          '/completer-profil',
          '/messages',
          '/notifications',
          '/favoris',
          '/historique',
          '/mes-biens',
          '/parametres',
          '/profil',
          '/validation',
          '/recherche',
          '/annonce/nouvelle',
          '/*/modifier',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
