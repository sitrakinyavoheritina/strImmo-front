import { sendGAEvent } from '@next/third-parties/google';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { hasAnalyticsConsent } from './consent';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export type AnalyticsEvent =
  | 'view_property'
  | 'search'
  | 'filter_property'
  | 'favorite_property'
  | 'contact_owner'
  | 'send_message'
  | 'login'
  | 'register'
  | 'publish_property';

// Seuls ces paramètres partent vers GA4 — tout le reste est ignoré, même si un appelant en passe
// un par erreur. Jamais de téléphone, email, nom, adresse précise, jeton ou identifiant de compte.
const ALLOWED_PARAMS = new Set([
  'property_id',
  'property_type',
  'kind',
  'price',
  'city',
  'search_term',
  'filter_name',
  'filter_value',
  'method',
  'role',
  'action',
  'source',
]);

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const LONG_NUMBER_PATTERN = /\d{6,}/;

type ParamValue = string | number | boolean | null | undefined;

function sanitizeValue(value: ParamValue): string | number | boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim().slice(0, 100);
    // Un texte libre (recherche) pourrait contenir un email ou un numéro de téléphone tapé par
    // l'utilisateur — on préfère perdre la valeur que d'envoyer une donnée personnelle.
    if (!trimmed || EMAIL_PATTERN.test(trimmed) || LONG_NUMBER_PATTERN.test(trimmed)) return undefined;
    return trimmed;
  }
  return value;
}

/** Envoie un événement GA4 — silencieux en toutes circonstances (GA absent, bloqué, consentement
 * refusé, compte admin) : une mesure ne doit jamais gêner l'utilisateur. */
export function trackEvent(name: AnalyticsEvent, params: Record<string, ParamValue> = {}): void {
  try {
    if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
    if (!hasAnalyticsConsent()) return;
    if (isAdmin(useAuthStore.getState().user)) return;

    const clean: Record<string, string | number | boolean> = {};
    for (const [key, raw] of Object.entries(params)) {
      if (!ALLOWED_PARAMS.has(key)) continue;
      const value = sanitizeValue(raw);
      if (value !== undefined) clean[key] = value;
    }
    sendGAEvent('event', name, clean);
  } catch {
    // ignoré volontairement
  }
}
