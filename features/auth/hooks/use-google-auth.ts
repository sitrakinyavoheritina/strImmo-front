'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';

// Connecte immédiatement, sans rien demander de plus — même logique post-connexion que useLogin
// (session, préférences), sauf la redirection : un compte fraîchement créé via Google n'a jamais
// de téléphone (`user.phone` absent, voir types.ts) tant qu'il n'a pas choisi son rôle et complété
// son profil sur /completer-profil (voir strImmo/src/auth/auth.service.ts:loginWithGoogle, qui
// crée le compte à la volée avec `phone: null`).
export function useGoogleAuth() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loginWithIdToken(idToken: string) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, token } = await authService.loginWithGoogle(idToken);
      setSession(user, token);
      setStoredTheme(user.themePreference);
      setStoredFeedDisplay(user.feedDisplay);
      if (!user.phone) {
        router.push('/completer-profil');
        return;
      }
      router.push(user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Connexion avec Google impossible. Réessayez.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { loginWithIdToken, isLoading, errorMessage };
}
