import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LikesStore {
  likedByUser: Record<string, string[]>;
  setLiked: (userId: string, propertyId: string, liked: boolean) => void;
}

/**
 * Ids des annonces "aimées" (cœur) par CE navigateur, indexés par utilisateur — distinct de
 * `useFavoritesStore` (annonces enregistrées pour plus tard). Le compteur affiché
 * (`property.likesCount`) est partagé côté backend (`properties.likes_count`), mais rien n'y
 * trace qui a aimé quoi : c'est ce store, purement local, qui permet de savoir si un clic doit
 * appeler `like` ou `unlike`. Indexer par `userId` (plutôt qu'une seule liste globale) évite
 * qu'un like posé par un compte reste affiché comme actif pour un autre compte connecté ensuite
 * sur le même navigateur — bug constaté : un like fait par "test1" apparaissait déjà "aimé" une
 * fois connecté en "test2", et cliquer déclenchait alors un `unlike` au lieu d'un `like`.
 */
export const useLikesStore = create<LikesStore>()(
  persist(
    (set) => ({
      likedByUser: {},
      setLiked: (userId, propertyId, liked) =>
        set((state) => {
          const current = state.likedByUser[userId] ?? [];
          const next = liked
            ? [...new Set([...current, propertyId])]
            : current.filter((id) => id !== propertyId);
          return { likedByUser: { ...state.likedByUser, [userId]: next } };
        }),
    }),
    { name: 'onina_likes' }
  )
);
