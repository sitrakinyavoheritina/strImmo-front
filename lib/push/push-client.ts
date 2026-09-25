import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/state/use-auth-store';

// Toutes les fonctions sont sûres à appeler côté navigateur uniquement (elles touchent
// `navigator`/`Notification`). Le service worker qui reçoit les notifications est public/sw.js,
// enregistré en production seulement (voir components/layout/service-worker-registration.tsx).

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getPushPermission(): NotificationPermission | 'unsupported' {
  return isPushSupported() ? Notification.permission : 'unsupported';
}

// La clé publique VAPID (base64url) doit être passée au navigateur sous forme d'octets.
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  // `ready` ne se résout jamais si aucun service worker n'est enregistré (ex. en développement,
  // où il n'est pas actif) : on abandonne au bout de quelques secondes plutôt que de bloquer.
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
  ]);
}

export async function isSubscribedToPush(): Promise<boolean> {
  const registration = await getRegistration();
  if (!registration) return false;
  return (await registration.pushManager.getSubscription()) !== null;
}

export type SubscribeResult = 'subscribed' | 'denied' | 'unsupported' | 'unavailable';

/** a) demande la permission, b) crée l'abonnement avec la clé VAPID publique du backend,
 *  c) envoie l'abonnement au backend. À déclencher depuis un clic (les navigateurs refusent de
 *  demander la permission sans geste de l'utilisateur). */
export async function subscribeToPush(): Promise<SubscribeResult> {
  if (!isPushSupported()) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const registration = await getRegistration();
  if (!registration) return 'unavailable';

  const { data } = await apiClient.get<{ publicKey: string | null }>('/push/public-key');
  if (!data.publicKey) return 'unavailable';

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    }));

  // Seulement endpoint + clés : `toJSON()` ajoute des champs (expirationTime) que l'API refuse.
  const { endpoint, keys } = subscription.toJSON();
  await apiClient.post('/push/subscribe', { endpoint, keys });
  return 'subscribed';
}

/** Désabonne CET appareil : supprime la ligne côté backend puis l'abonnement du navigateur.
 *  `token` explicite : à la déconnexion, la session locale est effacée juste après — la requête ne
 *  doit pas dépendre du store à ce moment-là. */
export async function unsubscribeFromPush(token?: string | null): Promise<void> {
  const registration = await getRegistration();
  const subscription = registration ? await registration.pushManager.getSubscription() : null;
  if (!subscription) return;
  const authToken = token ?? useAuthStore.getState().token;
  try {
    await apiClient.delete('/push/subscribe', {
      data: { endpoint: subscription.endpoint },
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  } catch {
    // Le backend nettoiera l'abonnement tout seul au premier envoi refusé (404/410).
  }
  await subscription.unsubscribe();
}

/** À appeler juste avant `clearSession()` : évite que l'utilisateur suivant sur ce navigateur
 *  reçoive les notifications du précédent. Sans attendre, sans jamais bloquer la déconnexion. */
export function unsubscribeOnLogout(): void {
  const token = useAuthStore.getState().token;
  void unsubscribeFromPush(token).catch(() => undefined);
}
