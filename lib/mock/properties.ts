export interface Property {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  location: string;
  type: 'location' | 'vente';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
}

/**
 * Mock property feed standing in for a future API call. Swap this for a
 * real fetch (e.g. in a server component or a data hook) once the backend
 * exists — every consumer already reads it as a plain array.
 */
export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Villa T4 moderne avec jardin',
    price: '1 500 000 Ar',
    priceUnit: '/ mois',
    location: 'Ivandry, Antananarivo',
    type: 'location',
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
  },
  {
    id: 'p2',
    title: 'Appartement T3 en centre-ville',
    price: '280 000 000 Ar',
    location: 'Isoraka, Antananarivo',
    type: 'vente',
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
  },
  {
    id: 'p3',
    title: 'Terrain titré-borné de 500 m²',
    price: '95 000 000 Ar',
    location: 'Ambohibao, Antananarivo',
    type: 'vente',
    area: 500,
  },
];
