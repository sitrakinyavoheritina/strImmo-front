import { create } from 'zustand';

// Vérification du numéro AVANT la première connexion d'un propriétaire / intermédiaire / agence :
// le backend refuse la connexion (403 PHONE_NOT_VERIFIED) et renvoie un jeton de vérification à
// usage unique (30 min) — gardé ici, en mémoire seulement (jamais persisté : recharger la page
// oblige à se reconnecter, ce qui renvoie un code frais). `isNewAccount` : venu d'une inscription,
// donc le message de bienvenue s'affichera après la vérification.
interface PendingVerification {
  verificationToken: string;
  phone: string;
  isNewAccount: boolean;
}

interface PendingVerificationStore {
  pending: PendingVerification | null;
  setPending: (pending: PendingVerification) => void;
  clear: () => void;
}

export const usePendingVerificationStore = create<PendingVerificationStore>()((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  clear: () => set({ pending: null }),
}));
