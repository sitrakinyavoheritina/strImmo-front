// Point unique de décision "a-t-on le droit de mesurer ?". Accordé par défaut pour l'instant (pas de
// bandeau de cookies encore) : quand il existera, il suffira de lire ici le choix enregistré —
// GA4 (components/analytics/analytics.tsx) et trackEvent l'interrogent tous les deux, rien d'autre
// n'est à modifier.
export function hasAnalyticsConsent(): boolean {
  return true;
}
