'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas';
import { trackEvent } from '@/lib/analytics/track';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getPhoneNotVerified } from '../utils/phone-not-verified';
import { usePhoneVerificationRedirect } from './use-phone-verification-redirect';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';
import { getSafeNextPath } from '@/lib/auth/safe-next-path';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const goToVerification = usePhoneVerificationRedirect();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, token } = await authService.login(data);
      setSession(user, token);
      trackEvent('login', { method: 'password', role: user.role });
      // Le compte a sa propre préférence enregistrée côté serveur — elle prend le dessus sur ce
      // qui était choisi localement en tant que visiteur, pour retrouver le même réglage que sur
      // n'importe quel autre appareil une fois connecté (voir /auth/preferences).
      setStoredTheme(user.themePreference);
      setStoredFeedDisplay(user.feedDisplay);
      // `next` (ex. redirigé depuis /demandes/nouvelle sans être connecté) passe avant tout le
      // reste : la personne avait une intention précise avant d'atterrir ici, pas seulement
      // "se connecter" dans l'absolu.
      const next = getSafeNextPath(searchParams.get('next'));
      if (next) {
        router.push(next);
        return;
      }
      // Déviation volontaire par rapport à l'app mobile (qui envoie admin/superadmin sur le
      // profil) : un admin arrive directement sur son tableau de bord (voir app/admin/) plutôt
      // que sur une fiche de profil qui ne lui sert à rien en priorité — demandé explicitement.
      router.push(user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/');
    } catch (error) {
      // Propriétaire / intermédiaire / agence dont le numéro n'est pas vérifié : pas de session, écran du code.
      const notVerified = getPhoneNotVerified(error);
      if (notVerified) {
        goToVerification(notVerified, false);
        return;
      }
      setErrorMessage(getErrorMessage(error, 'Identifiants incorrects.'));
    } finally {
      setIsLoading(false);
    }
  });

  return { form, isLoading, errorMessage, onSubmit };
}
