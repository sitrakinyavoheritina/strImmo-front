import { useQuery } from '@tanstack/react-query';

type GeocodeResult = { latitude: number; longitude: number } | null;

// Un seul appel direct à l'API Mapbox Geocoding (même fournisseur que la carte, voir
// MapPositionPicker) — pas de nouveau référentiel de coordonnées par fokontany à maintenir, le
// jeu de données source (madagascar-data) n'en fournit pas.
async function geocode(query: string): Promise<GeocodeResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  const params = new URLSearchParams({ access_token: token, country: 'mg', limit: '1' });
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as { features?: { center: [number, number] }[] };
  const feature = data.features?.[0];
  if (!feature) return null;
  const [longitude, latitude] = feature.center;
  return { latitude, longitude };
}

// Les 6 arrondissements d'Antananarivo n'ont aucune info de district/région dans le jeu de
// données source (data/madagascar-fokontany.csv, côté backend) — envoyé tel quel à Mapbox, "2e
// Arrondissement" seul n'est pas reconnu comme un lieu et fait remonter un résultat sans rapport
// (constaté : "Ambatoroka, 2e Arrondissement, Madagascar" retournait un homonyme à
// Vatovavy-Fitovinany au lieu de l'Ambatoroka d'Antananarivo). Ce sont les 6 seules communes ainsi
// nommées dans tout le jeu de données, et appartiennent toutes à la capitale — remplacer par le
// nom de la ville, que Mapbox résout correctement (vérifié : score de confiance 1.0).
const ARRONDISSEMENT_PATTERN = /^\d+(er|e)\s+Arrondissement$/i;

function resolveCommuneQueryName(communeName: string): string {
  return ARRONDISSEMENT_PATTERN.test(communeName) ? 'Antananarivo' : communeName;
}

// Position approximative de départ pour la carte (voir property-form.tsx) — lancée dès la
// commune choisie (pas d'attendre le fokontany, demandé explicitement), puis affinée dès que le
// fokontany l'est aussi (la requête change, donc re-déclenchée). L'utilisateur affine ensuite
// manuellement (glisser le marker) : ceci ne détermine jamais la position finale enregistrée,
// juste où la carte s'ouvre.
export function useGeocodeFokontany(fokontanyName: string | undefined, communeName: string | undefined) {
  const query = communeName
    ? fokontanyName
      ? `${fokontanyName}, ${resolveCommuneQueryName(communeName)}, Madagascar`
      : `${resolveCommuneQueryName(communeName)}, Madagascar`
    : undefined;

  return useQuery({
    queryKey: ['geocode-fokontany', query],
    queryFn: () => geocode(query as string),
    enabled: !!query,
    staleTime: Infinity,
  });
}
