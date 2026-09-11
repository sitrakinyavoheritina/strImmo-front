import { create } from 'zustand';
import type { PropertyFilters, PropertyType } from '@/features/search/types/listing.types';

interface HomeSearchFiltersStore {
  filters: PropertyFilters;
  update: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  selectPropertyType: (value: PropertyType | undefined) => void;
  setFilters: (filters: PropertyFilters) => void;
  reset: () => void;
}

// Filtres de la barre de recherche de l'accueil, partagés entre `SearchSection`/`QuickSearchForm`
// (dans le fil central) et `SidebarAdvancedFilters` (dans la sidebar gauche, un arbre React
// totalement séparé, monté par AppShell) — un store global évite le prop-drilling entre ces deux
// arbres et permet à "Type de bien" choisi dans la barre de piloter les champs spécifiques au
// type affichés plus bas dans la sidebar. Volontairement non persisté : ce sont des filtres de
// session, pas une préférence à retrouver après un rechargement de page.
export const useHomeSearchFiltersStore = create<HomeSearchFiltersStore>()((set) => ({
  filters: {},
  update: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  selectPropertyType: (value) =>
    set((state) => ({
      filters: {
        kind: state.filters.kind,
        location: state.filters.location,
        minPrice: state.filters.minPrice,
        maxPrice: state.filters.maxPrice,
        publisherType: state.filters.publisherType,
        propertyType: value,
      },
    })),
  setFilters: (filters) => set({ filters }),
  reset: () => set({ filters: {} }),
}));
