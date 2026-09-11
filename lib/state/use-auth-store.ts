import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/features/auth/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  updateUser: (partial: Partial<User>) => void;
}

// Session courante (utilisateur + JWT), persistée en localStorage — le backend n'expose aucun
// `GET /profile` (voir strImmo/src/auth/auth.controller.ts) : la session doit donc survivre au
// rechargement de page uniquement via ce qui a été reçu à la connexion/inscription, exactement
// comme le fait le store équivalent côté mobile (Onina-mobile/src/store/auth-store.ts). Une seule
// persistance suffit ici (contrairement au mobile qui duplique dans SecureStore/AsyncStorage) :
// `persist` utilise déjà localStorage par défaut sur web, pour l'utilisateur comme pour le token.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (partial) =>
        set((state) => (state.user ? { user: { ...state.user, ...partial } } : state)),
    }),
    { name: 'onina_auth' }
  )
);

/** À utiliser partout où l'absence de session doit déclencher une action (ex. redirection vers
 *  /connexion) : sans ça, `isAuthenticated` vaut encore `false` le temps que `persist` relise la
 *  session depuis localStorage, et cette action se déclencherait à tort pour un utilisateur en
 *  fait déjà connecté. `useSyncExternalStore` (pas useState+useEffect) : c'est l'outil React
 *  prévu pour s'abonner à un système externe comme `persist` sans provoquer de rendu en trop —
 *  `onFinishHydration` fournit l'abonnement, `hasHydrated()` l'état courant à tout instant (donc
 *  correct même si la réhydratation était déjà terminée avant le montage du composant). */
export function useAuthHasHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useAuthStore.persist.onFinishHydration(callback),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  );
}
