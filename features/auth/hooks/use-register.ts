'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(payload: RegisterPayload) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await authService.register(payload);
      if (result.status === 'authenticated') {
        setSession(result.user, result.token);
        setStoredTheme(result.user.themePreference);
        setStoredFeedDisplay(result.user.feedDisplay);
        router.push('/');
      } else {
        router.push('/connexion?attente=1');
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Une erreur est survenue lors de l'inscription."));
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, errorMessage };
}
