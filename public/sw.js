// Service worker de l'app — enregistré uniquement en production (voir
// components/layout/service-worker-registration.tsx). Deux objectifs seulement, volontairement
// limités : 1) rendre le site installable de façon fiable (un vrai service worker actif renforce
// les critères d'installation des navigateurs, au-delà du seul manifest) et 2) afficher un écran de
// secours correct plutôt que l'erreur générique du navigateur quand une navigation échoue hors
// ligne. Il ne met JAMAIS en cache un appel à l'API ni une navigation elle-même : Onina est un
// marketplace avec messagerie en temps réel (WebSocket) et annonces qui changent — servir une
// réponse API ou une page HTML périmée depuis le cache serait pire qu'une erreur réseau claire.
// Seuls les fichiers statiques de même origine (JS/CSS "hashés" par Next, donc déjà immuables par
// construction, icônes, logo) sont mis en cache — sans risque de péremption : un nouveau
// déploiement change leur URL plutôt que leur contenu.

const CACHE_VERSION = 'onina-shell-v1';
const OFFLINE_URL = '/offline.html';
// Racine ('/') volontairement absente de cette liste : sa mise en cache dépendrait de la réponse
// HTML du moment (âge du compte connecté, etc.) — seule la page de secours, statique et neutre,
// est préchargée à l'installation.
const PRECACHE_URLS = [OFFLINE_URL, '/manifest.webmanifest', '/manifest-icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Fichiers statiques de même origine sûrs à mettre en cache indéfiniment (immuables, voir plus
// haut) : le dossier "hashé" de Next, et les images/polices/icônes servies telles quelles.
function isCacheableStaticAsset(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/_next/static/')) return true;
  return /\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation (changement de page, y compris rechargement) : toujours le réseau en priorité —
  // seule une vraie panne réseau bascule sur l'écran de secours, jamais une version en cache
  // potentiellement obsolète.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()))
    );
    return;
  }

  if (!isCacheableStaticAsset(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // `response.ok` seulement : ne jamais mettre en cache une 404/500 (ex. une icône
        // maskable pas encore déployée sur un environnement donné).
        if (response.ok) {
          const toCache = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, toCache));
        }
        return response;
      });
    })
  );
});
