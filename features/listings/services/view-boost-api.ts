import { apiClient } from '@/lib/api/client';
import type { Property } from '@/features/search/types/listing.types';
import { mapApiPropertyToProperty } from '@/features/search/services/property-mapper';
import type { ApiProperty } from '@/features/search/services/property-api';

// Module séparé, volontairement PAS fusionné dans property-api.ts/listing-service.ts (partagés et
// chargés par tout le monde) : seul le panneau admin "Boost des vues" (voir
// features/listings/components/view-boost-section.tsx, chargé via `next/dynamic` depuis
// annonce-client.tsx) importe ce fichier — et donc le seul endroit où le chemin littéral
// `/view-boost` existe dans un bundle JS envoyé au navigateur est le chunk admin, jamais le
// bundle principal qu'un visiteur non-admin télécharge.
export type UpdateViewBoostPayload = {
  enabled: boolean;
  dayStart: string;
  dayEnd: string;
  nightStart: string;
  nightEnd: string;
  dayTarget: number;
  nightTarget: number;
  likeDayTarget: number;
  likeNightTarget: number;
};

export function updateViewBoost(id: string, payload: UpdateViewBoostPayload): Promise<Property> {
  return apiClient
    .patch<ApiProperty>(`/properties/${id}/view-boost`, payload)
    .then((r) => mapApiPropertyToProperty(r.data));
}

// Remet à 0 le compteur boosté (vues OU j'aime) déjà affiché publiquement — corrige une saisie
// malheureuse sans attendre le changement de date calendaire du lendemain. Ne touche ni aux
// horaires ni aux objectifs configurés, voir PropertyViewBoostService.resetCounters côté backend.
export function resetViewBoost(id: string, metric: 'views' | 'likes'): Promise<Property> {
  return apiClient
    .patch<ApiProperty>(`/properties/${id}/view-boost/reset`, { metric })
    .then((r) => mapApiPropertyToProperty(r.data));
}
