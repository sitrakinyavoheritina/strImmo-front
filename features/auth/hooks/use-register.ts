'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markWelcomePending } from '@/lib/auth/welcome-flag';
import { trackEvent } from '@/lib/analytics/track';
import { getPhoneNotVerified } from '../utils/phone-not-verified';
import { usePhoneVerificationRedirect } from './use-phone-verification-redirect';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';
import type { RegisterPayload } from '../types';

// Orchestration partagée par les 4 formulaires d'inscription (owner/tenant/agent/agency) : chaque
// formulaire construit son propre payload typé (champs différents par rôle, voir types.ts) et
// délègue la soumission ici. owner/tenant ouvrent une session immédiatement ; agent/agency
// n'obtiennent pas de token (compte "pending", voir auth-service.ts) et sont renvoyés vers la
// connexion avec un message d'attente.
export function useRegisterSubmit() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const goToVerification = usePhoneVerificationRedirect();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(payload: RegisterPayload) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await authService.register(payload);
      trackEvent('register', { method: 'password', role: payload.role });
      if (payload.role === 'tenant' && result.status === 'authenticated') {
        // Locataire : session tout de suite, aucun code à l'inscription.
        setSession(result.user, result.token);
        markWelcomePending(result.user.id);
        setStoredTheme(result.user.themePreference);
        setStoredFeedDisplay(result.user.feedDisplay);
        router.push('/');
      } else {
        // Propriétaire, intermédiaire, agence : un code SMS (et email) vient d'être envoyé et AUCUNE
        // session n'est ouverte avant sa saisie. On rejoue une connexion : le backend répond alors
        // 403 PHONE_NOT_VERIFIED avec le jeton de vérification (on ignore le jeton d'accès que
        // l'inscription propriétaire renvoie encore, pour rester compatible avec l'app mobile).
        try {
          const session = await authService.login({ identifier: payload.phone, password: payload.password });
          setSession(session.user, session.token);
          markWelcomePending(session.user.id);
          setStoredTheme(session.user.themePreference);
          setStoredFeedDisplay(session.user.feedDisplay);
          router.push('/');
        } catch (loginError) {
          const notVerified = getPhoneNotVerified(loginError);
          if (!notVerified) throw loginError;
          goToVerification(notVerified, true);
        }
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Une erreur est survenue lors de l'inscription."));
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, errorMessage };
}
