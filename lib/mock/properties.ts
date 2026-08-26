export type PropertyCategory = 'maison' | 'appartement' | 'terrain' | 'bureau';

export interface Property {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  location: string;
  type: 'location' | 'vente';
  category: PropertyCategory;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  /** Nombre de vues, utilisé pour dériver la section "Annonces populaires". */
  views: number;
  /** Photos de l'annonce, la première sert de couverture. */
  photos: string[];
  comfortable?: boolean;
  /** Uniquement pertinent pour les locations. */
  rentalPeriod?: 'mensuel' | 'journalier';
  carAccess?: boolean;
  motoAccess?: boolean;
  /** Nombre maximum de personnes acceptées (locations). */
  maxOccupants?: number;
  /** Caution exigée à l'entrée (locations). */
  depositRequired?: boolean;
  description?: string;
  contactPhone?: string;
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
    category: 'maison',
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    views: 812,
    photos: ['/images1.jpeg', '/image3.jpg', '/images4.jpeg'],
    comfortable: true,
    rentalPeriod: 'mensuel',
    carAccess: true,
    motoAccess: true,
    maxOccupants: 6,
    depositRequired: false,
    description:
      "Belle villa T4 moderne avec piscine et jardin arboré, idéale pour une famille. Cuisine équipée, double séjour lumineux. Sans caution, contrat direct avec le propriétaire.",
    contactPhone: '+261 34 00 000 01',
  },
  {
    id: 'p2',
    title: 'Appartement T3 en centre-ville',
    price: '280 000 000 Ar',
    location: 'Isoraka, Antananarivo',
    type: 'vente',
    category: 'appartement',
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    views: 1204,
    photos: ['/image3.jpg', '/images1.jpeg', '/image2.avif'],
    comfortable: true,
    carAccess: true,
    motoAccess: false,
    description:
      "Appartement T3 rénové au cœur d'Isoraka, proche des commodités et des axes principaux. Vue dégagée, immeuble sécurisé avec gardiennage.",
    contactPhone: '+261 34 00 000 02',
  },
  {
    id: 'p3',
    title: 'Terrain titré-borné de 500 m²',
    price: '95 000 000 Ar',
    location: 'Ambohibao, Antananarivo',
    type: 'vente',
    category: 'terrain',
    area: 500,
    views: 356,
    photos: ['/terrain1.jpeg', '/terrain2.jpeg'],
    description:
      "Terrain plat, titré et borné, viabilisé (eau et électricité en bordure). Idéal pour projet de construction résidentielle. Accès direct par route praticable toute l'année.",
    contactPhone: '+261 34 00 000 03',
  },
  {
    id: 'p4',
    title: 'Studio meublé proche université',
    price: '450 000 Ar',
    priceUnit: '/ mois',
    location: 'Ankatso, Antananarivo',
    type: 'location',
    category: 'appartement',
    bedrooms: 1,
    bathrooms: 1,
    area: 28,
    views: 967,
    photos: ['/image2.avif', '/images1.jpeg', '/image3.jpg'],
    comfortable: true,
    rentalPeriod: 'mensuel',
    carAccess: false,
    motoAccess: true,
    maxOccupants: 2,
    depositRequired: false,
    description:
      "Studio meublé et sécurisé, à 5 minutes à pied de l'université. Eau et électricité incluses. Sans caution, idéal pour étudiant.",
    contactPhone: '+261 34 00 000 04',
  },
  {
    id: 'p5',
    title: 'Villa de standing avec piscine',
    price: '620 000 000 Ar',
    location: 'Ambatobe, Antananarivo',
    type: 'vente',
    category: 'maison',
    bedrooms: 5,
    bathrooms: 4,
    area: 320,
    views: 1489,
    photos: ['/images4.jpeg', '/images1.jpeg', '/image3.jpg'],
    comfortable: true,
    carAccess: true,
    motoAccess: true,
    description:
      "Villa de standing dans quartier résidentiel calme, piscine, jardin paysager et garage double. Finitions haut de gamme.",
    contactPhone: '+261 34 00 000 05',
  },
  {
    id: 'p6',
    title: 'Appartement T2 vue mer',
    price: '900 000 Ar',
    priceUnit: '/ mois',
    location: 'Mahajanga',
    type: 'location',
    category: 'appartement',
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    views: 601,
    photos: ['/image3.jpg', '/image2.avif', '/images4.jpeg'],
    comfortable: true,
    rentalPeriod: 'mensuel',
    carAccess: true,
    motoAccess: true,
    maxOccupants: 3,
    depositRequired: true,
    description:
      "Appartement T2 avec vue mer, balcon spacieux, résidence calme à proximité de la plage. Caution équivalente à un mois de loyer.",
    contactPhone: '+261 34 00 000 06',
  },
  {
    id: 'p7',
    title: 'Terrain constructible 800 m²',
    price: '140 000 000 Ar',
    location: 'Tamatave',
    type: 'vente',
    category: 'terrain',
    area: 800,
    views: 289,
    photos: ['/terrain2.jpeg', '/terrain1.jpeg'],
    description:
      "Terrain constructible en zone résidentielle en développement, à proximité de la route nationale. Bornage récent, titre disponible.",
    contactPhone: '+261 34 00 000 07',
  },
  {
    id: 'p8',
    title: 'Bureau climatisé open space',
    price: '2 100 000 Ar',
    priceUnit: '/ mois',
    location: 'Ankorondrano, Antananarivo',
    type: 'location',
    category: 'bureau',
    bathrooms: 2,
    area: 180,
    views: 742,
    photos: ['/images4.jpeg', '/image2.avif', '/image3.jpg'],
    comfortable: true,
    rentalPeriod: 'mensuel',
    carAccess: true,
    motoAccess: true,
    maxOccupants: 15,
    depositRequired: true,
    description:
      "Espace de bureau climatisé et modulable, open space avec 2 salles de réunion. Parking sécurisé, groupe électrogène de secours.",
    contactPhone: '+261 34 00 000 08',
  },
];

/** Les biens les plus consultés, pour la section "Annonces populaires". */
export const POPULAR_PROPERTIES: Property[] = [...MOCK_PROPERTIES]
  .sort((a, b) => b.views - a.views)
  .slice(0, 6);

export function getPropertyById(id: string): Property | undefined {
  return MOCK_PROPERTIES.find((property) => property.id === id);
}
