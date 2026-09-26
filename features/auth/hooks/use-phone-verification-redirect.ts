'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { usePendingVerificationStore } from '@/lib/state/use-pending-verification-store';
import type { PhoneNotVerified } from '../utils/phone-not-verified';

/** Envoie vers l'écran du code, SANS session : ferme toute session partielle (ex. compte Google
 *  encore connecté) et garde le jeton de vérification en mémoire. */
export function usePhoneVerificationRedirect() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const setPending = usePendingVerificationStore((state) => state.setPending);

  return function goToVerification(info: PhoneNotVerified, isNewAccount: boolean) {
    clearSession();
    setPending({ ...info, isNewAccount });
    router.push('/verification-telephone');
  };
}
