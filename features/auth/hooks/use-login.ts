'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';

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
      // Même comportement que mobile : admin/superadmin atterrit sur le profil, tout le monde
      // d'autre sur l'accueil (voir Onina-mobile/src/features/auth/screens/login-screen.tsx).
      router.push(user.role === 'admin' || user.role === 'superadmin' ? '/profil' : '/');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Identifiants incorrects.'));
    } finally {
      setIsLoading(false);
    }
  });

  return { form, isLoading, errorMessage, onSubmit };
}
