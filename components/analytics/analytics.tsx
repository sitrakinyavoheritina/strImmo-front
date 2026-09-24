'use client';

import { useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { apiClient } from '@/lib/api/client';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { hasAnalyticsConsent } from '@/lib/analytics/consent';
import { GA_MEASUREMENT_ID } from '@/lib/analytics/track';
import { consumeAnonymousActivityFlag, getVisitorId, rotateVisitorId } from '@/lib/analytics/visitor-id';

/** Monté une seule fois dans le layout racine. 1) charge GA4 (page_view automatique, y compris sur
 * les changements de page sans rechargement — App Router / PWA) ; 2) rattache l'historique anonyme
 * du navigateur au compte dès qu'une session s'ouvre. Rien n'est rendu avant l'hydratation : pas
 * de différence serveur/client possible. */
export function Analytics() {
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    if (!consumeAnonymousActivityFlag()) return;
    const visitorId = getVisitorId();
    if (!visitorId) return;
    apiClient
      .post('/property-views/claim', { visitorId })
      .then(() => rotateVisitorId())
      .catch(() => undefined);
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated || !GA_MEASUREMENT_ID || !hasAnalyticsConsent() || isAdmin(user)) return null;
  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
