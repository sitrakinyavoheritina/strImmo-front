'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
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
      // Le compte a sa propre préférence enregistrée côté serveur — elle prend le dessus sur ce
      // qui était choisi localement en tant que visiteur, pour retrouver le même réglage que sur
      // n'importe quel autre appareil une fois connecté (voir /auth/preferences).
      setStoredTheme(user.themePreference);
      setStoredFeedDisplay(user.feedDisplay);
      // Déviation volontaire par rapport à l'app mobile (qui envoie admin/superadmin sur le
      // profil) : un admin arrive directement sur son tableau de bord (voir app/admin/) plutôt
      // que sur une fiche de profil qui ne lui sert à rien en priorité — demandé explicitement.
      router.push(user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Identifiants incorrects.'));
    } finally {
      setIsLoading(false);
    }
  });

  return { form, isLoading, errorMessage, onSubmit };
}
