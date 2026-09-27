import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RequestLikesStore {
  likedByUser: Record<string, string[]>;
  setLiked: (userId: string, requestId: string, liked: boolean) => void;
}

/** Ids des demandes "aimées" (cœur) par CE navigateur, indexés par utilisateur — même principe
 *  que useLikesStore (annonces), store séparé pour ne jamais mélanger un id de demande avec un id
 *  d'annonce dans la même liste. */
export const useRequestLikesStore = create<RequestLikesStore>()(
  persist(
    (set) => ({
      likedByUser: {},
      setLiked: (userId, requestId, liked) =>
        set((state) => {
          const current = state.likedByUser[userId] ?? [];
          const next = liked
            ? [...new Set([...current, requestId])]
            : current.filter((id) => id !== requestId);
          return { likedByUser: { ...state.likedByUser, [userId]: next } };
        }),
    }),
    { name: 'onina_request_likes' }
  )
);
