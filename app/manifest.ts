import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Onina.mg - Immobilier à Madagascar',
    short_name: 'Onina',
    description: "Trouvez votre chez-vous : Achat, vente et location d'immobiliers à Madagascar.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'fr',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    categories: ['business', 'lifestyle', 'shopping'],
    icons: [
      {
        src: '/manifest-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/manifest-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
