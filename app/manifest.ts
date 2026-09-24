import type { MetadataRoute } from 'next';

// `background_color`/`theme_color` : couleur crème de fond de page (voir --color-surface-app dans
// globals.css) — écran de démarrage (splash) et chrome du navigateur/OS cohérents avec le premier
// affichage réel de l'app plutôt qu'un flash d'une autre teinte. Anciennes valeurs (bleu #2563eb,
// fond #f8fafc) : restes de la palette bleue remplacée le 2026-09-10, jamais mises à jour ici.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Onina.mg - L’immobilier à Madagascar',
    short_name: 'Onina',
    description: "L’immobilier à Madagascar. Trouvez. Fondez. Habitez.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'fr',
    background_color: '#f3e8d2',
    theme_color: '#f3e8d2',
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
      // Variantes "maskable" (voir les deux routes correspondantes) : Android peut découper ces
      // icônes dans n'importe quelle forme selon le thème du téléphone — sans elles, le système
      // réutilise les icônes "any" ci-dessus et rogne le logo dans les cas les plus agressifs.
      {
        src: '/manifest-icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/manifest-icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
