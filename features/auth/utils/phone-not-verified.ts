import axios from 'axios';

export type PhoneNotVerified = { verificationToken: string; phone: string };

/** Reconnaît la réponse 403 « PHONE_NOT_VERIFIED » du backend (connexion, Google, compléter le
 *  profil d'un propriétaire/intermédiaire/agence dont le numéro n'est pas encore vérifié). */
export function getPhoneNotVerified(error: unknown): PhoneNotVerified | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) return null;
  const data = error.response.data as { code?: string; verificationToken?: string; phone?: string } | undefined;
  if (data?.code !== 'PHONE_NOT_VERIFIED' || !data.verificationToken) return null;
  return { verificationToken: data.verificationToken, phone: data.phone ?? '' };
}
