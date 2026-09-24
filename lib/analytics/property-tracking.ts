import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { trackEvent } from './track';
import { getVisitorId, markAnonymousActivity } from './visitor-id';

// Même fenêtre que le backend (PropertyViewsService) : évite l'appel réseau ET le doublon GA4 pour
// un rafraîchissement ou le double effet de React Strict Mode — sessionStorage est synchrone, donc
// la 2ᵉ exécution voit déjà la clé posée par la 1ʳᵉ.
const DEDUP_WINDOW_MS = 30 * 60 * 1000;

function alreadySeen(key: string): boolean {
  try {
    const last = Number(sessionStorage.getItem(key));
    if (last && Date.now() - last < DEDUP_WINDOW_MS) return true;
    sessionStorage.setItem(key, String(Date.now()));
    return false;
  } catch {
    return false;
  }
}

type TrackedProperty = {
  id: string;
  propertyType: string;
  kind: string;
  price: number;
  communeName?: string;
};

function postToBackend(path: string, propertyId: string): void {
  const visitorId = getVisitorId();
  if (!useAuthStore.getState().isAuthenticated) markAnonymousActivity();
  // Sans `await` ni propagation d'erreur : jamais bloquant pour l'affichage de l'annonce.
  apiClient.post(path, { propertyId, visitorId: visitorId ?? undefined }).catch(() => undefined);
}

export function trackPropertyView(property: TrackedProperty): void {
  if (alreadySeen(`onina_pv_${property.id}`)) return;
  trackEvent('view_property', {
    property_id: property.id,
    property_type: property.propertyType,
    kind: property.kind,
    price: property.price,
    city: property.communeName,
  });
  postToBackend('/property-views', property.id);
}

export function trackPropertyContact(property: TrackedProperty | { id: string }): void {
  if (alreadySeen(`onina_pc_${property.id}`)) return;
  trackEvent('contact_owner', { property_id: property.id, method: 'copy_phone' });
  postToBackend('/property-views/contact', property.id);
}
