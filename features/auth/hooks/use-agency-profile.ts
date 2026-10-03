import { useQuery } from '@tanstack/react-query';
import { authApi } from '../services/auth-api';

/** Champs propres à une agence (agencyName/address/website/facebookUrl/description), absents de
 *  la session — voir strImmo/src/auth/auth.service.ts:getMyAgencyProfile. `enabled` : n'interroge
 *  l'API que pour un compte agence, inutile sinon (la route renverrait `null`). */
export function useAgencyProfile(enabled: boolean) {
  return useQuery({
    queryKey: ['agency-profile'],
    queryFn: () => authApi.getAgencyProfile(),
    enabled,
  });
}
