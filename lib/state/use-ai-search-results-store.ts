import { create } from 'zustand';
import type { Property } from '@/features/search/types/listing.types';

interface AiSearchResultsStore {
  results: Property[] | null;
  setResults: (results: Property[]) => void;
  clear: () => void;
}

// Pont client-side entre le panneau "Recherche IA" (accueil) et /recherche : l'assistant ne
// renvoie que des annonces déjà résolues, jamais de filtres structurés réutilisables dans l'URL
// (voir strImmo/src/chat/chat.service.ts) — impossible donc de reconstruire une recherche
// classique par filtres. "Voir les résultats de recherche" dépose ici la liste déjà obtenue, que
// /recherche affiche telle quelle (voir app/recherche/page.tsx) au lieu de relancer une requête.
export const useAiSearchResultsStore = create<AiSearchResultsStore>((set) => ({
  results: null,
  setResults: (results) => set({ results }),
  clear: () => set({ results: null }),
}));
