'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/track';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getPhoneNotVerified } from '../utils/phone-not-verified';
import { usePhoneVerificationRedirect } from './use-phone-verification-redirect';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';
import { getSafeNextPath } from '@/lib/auth/safe-next-path';

// Connecte immédiatement, sans rien demander de plus — même logique post-connexion que useLogin
// (session, préférences), sauf la redirection : un compte fraîchement créé via Google
// (`hasCompletedProfile: false`, voir types.ts) doit d'abord choisir son rôle sur
// /completer-profil avant de rejoindre sa destination (voir strImmo/src/auth/auth.service.ts:
// loginWithGoogle).
export function useGoogleAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const goToVerification = usePhoneVerificationRedirect();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loginWithIdToken(idToken: string) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, token } = await authService.loginWithGoogle(idToken);
      setSession(user, token);
      trackEvent('login', { method: 'google', role: user.role });
      setStoredTheme(user.themePreference);
      setStoredFeedDisplay(user.feedDisplay);
      const next = getSafeNextPath(searchParams.get('next'));
      if (!user.hasCompletedProfile) {
        // Compte flambant neuf (voir loginWithGoogle) : `next` doit encore attendre le choix du
        // rôle sur /completer-profil (le numéro y est facultatif), qui le reprendra à son tour
        // une fois ce compte complété (voir ce fichier).
        router.push(next ? `/completer-profil?next=${encodeURIComponent(next)}` : '/completer-profil');
        return;
      }
      if (next) {
        router.push(next);
        return;
      }
      router.push(user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/');
    } catch (error) {
      const notVerified = getPhoneNotVerified(error);
      if (notVerified) {
        goToVerification(notVerified, false);
        return;
      }
      setErrorMessage(getErrorMessage(error, 'Connexion avec Google impossible. Réessayez.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { loginWithIdToken, isLoading, errorMessage };
}
