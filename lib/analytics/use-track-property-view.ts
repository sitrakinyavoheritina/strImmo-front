'use client';

import { useEffect } from 'react';
import { trackPropertyView } from './property-tracking';

type Viewed = { id: string; propertyType: string; kind: string; price: number; communeName?: string };

/** À appeler sur la page d'une annonce : envoie `view_property` (GA4) et enregistre la
 * consultation côté backend, une seule fois par annonce et par fenêtre de 30 minutes (voir
 * property-tracking.ts). Dépend de l'identifiant seul — un rafraîchissement des données de
 * l'annonce par React Query ne relance donc rien. Jamais bloquant. */
export function useTrackPropertyView(property: Viewed | undefined) {
  const id = property?.id;
  useEffect(() => {
    if (!property) return;
    trackPropertyView(property);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}
