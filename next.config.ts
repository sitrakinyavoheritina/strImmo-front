import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next envoie `X-Powered-By: Next.js` par défaut sur chaque réponse — aucune fonction, juste une
  // information gratuite sur la techno utilisée pour quiconque prépare une attaque ciblée.
  poweredByHeader: false,
  allowedDevOrigins: ["51.195.221.82"],
  images: {
    remotePatterns: [
      // Photos/avatars hébergés sur Cloudflare R2 (voir strImmo/src/storage/storage.service.ts,
      // R2_PUBLIC_URL) — motif générique (pas le seul sous-domaine actuel) pour survivre à une
      // rotation du bucket sans retoucher ce fichier.
      { protocol: "https", hostname: "*.r2.dev" },
      // Domaine personnalisé du bucket R2 (R2_PUBLIC_URL=https://img.onina.mg) — celui que les
      // nouvelles photos utilisent ; les anciennes URL *.r2.dev ci-dessus restent valables.
      { protocol: "https", hostname: "img.onina.mg" },
      // Anciennes photos encore hébergées sur Cloudinary (avant la migration vers R2) — certaines
      // annonces existantes en base y pointent toujours.
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Photo de profil Google — renvoyée telle quelle par Google dans `picture` et reprise comme
      // avatarUrl pour un compte créé via "Se connecter avec Google" (voir
      // strImmo/src/auth/auth.service.ts:loginWithGoogle).
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // En-têtes recommandés par le guide PWA officiel de Next.js. Globaux : `nosniff` et la politique
  // de referrer sont sans risque de casser une fonctionnalité existante (Mapbox, connexion
  // Google...) ; `X-Frame-Options: DENY` ne concerne que le fait d'encadrer LES PAGES D'ONINA dans
  // un iframe externe, pas les services externes qu'Onina appelle lui-même. Sans le en-tête
  // Cache-Control sur /sw.js, un navigateur pourrait garder une ancienne version du service worker
  // en cache HTTP au-delà de ce qu'il vérifie normalement pour ce type de fichier, retardant la
  // prise en compte d'une future mise à jour de sa logique de cache (voir public/sw.js et
  // components/layout/service-worker-registration.tsx) ; son Content-Type explicite est nécessaire
  // car ce fichier est servi depuis `public/` sans passer par un Route Handler qui l'aurait déjà
  // posé.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Interdit au navigateur de jamais revenir en HTTP sur ce domaine pendant 180 jours
          // (même en tapant l'URL sans https://) — bloque une redirection HTTP→HTTPS piégée en
          // cours de route. `includeSubDomains` couvre aussi api.onina.mg, qui doit de toute façon
          // rester en HTTPS en permanence (voir public/sw.js : le service worker exige un contexte
          // sécurisé). N'a aucun effet tant que le site n'est pas encore servi en HTTPS (ce que le
          // navigateur exige déjà pour honorer ce en-tête) — sans risque à poser dès maintenant.
          {
            key: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains",
          },
          // Désactive caméra/micro (inutilisés nulle part dans l'app) ; la géolocalisation reste
          // autorisée pour Onina lui-même — "Utiliser ma position" à la création d'une annonce et
          // "Près de chez vous" en dépendent (voir map-position-picker.tsx,
          // nearby-properties-map-widget.tsx) — seulement bloquée pour un iframe tiers qui tenterait
          // de la demander depuis une page d'Onina, ce qui n'arrive jamais aujourd'hui.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
