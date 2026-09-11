'use client';

import { useState } from 'react';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';
import type { UpdateProfilePayload } from '../types';

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(payload: UpdateProfilePayload): Promise<boolean> {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.updateProfile(payload);
      // Pas de nouveau token renvoyé par PATCH /auth/profile : on fusionne juste les champs à
      // jour dans la session existante (voir use-auth-store.ts:updateUser).
      updateUser(user);
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de mettre à jour le profil.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, errorMessage };
}
