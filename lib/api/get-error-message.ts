import axios from 'axios';

// strImmo renvoie déjà des messages d'erreur en français directement affichables (ex. "Ce numéro
// de téléphone est déjà utilisé", "Ce mot de passe est déjà utilisé...") — on les relaie tels
// quels plutôt que de les remplacer par un message générique, sauf si la requête n'a même pas
// atteint le serveur (timeout, coupure réseau...). Port direct de l'utilitaire mobile équivalent.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message[0];
    if (typeof data?.message === 'string') return data.message;
  }
  return fallback;
}
