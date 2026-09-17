import { create } from 'zustand';

interface NearbyPositionState {
  position: { latitude: number; longitude: number } | null;
  error: string | null;
  setPosition: (position: { latitude: number; longitude: number }) => void;
  setError: (error: string) => void;
}

// Position géolocalisée une seule fois par session (pas de `persist` : un rechargement complet de
// page compte comme une nouvelle "première ouverture" de l'accueil) — mémorisée ici plutôt que
// dans un `useState` local à NearbyPropertiesMapWidget, qui se démonte/remonte à chaque fois qu'on
// quitte puis revient sur l'accueil (le composant n'est pas persistant entre les pages). Sans ce
// store, chaque retour sur l'accueil relançait une nouvelle géolocalisation et un nouveau
// chargement des annonces proches — demandé explicitement de ne charger qu'une fois.
export const useNearbyPositionStore = create<NearbyPositionState>((set) => ({
  position: null,
  error: null,
  setPosition: (position) => set({ position, error: null }),
  setError: (error) => set({ error }),
}));
