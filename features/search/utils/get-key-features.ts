import type { Property, PropertyType, WaterSource, LandStatus } from '../types/listing.types';

// Réutilisé partout où le type de bien doit s'afficher (fil, page détail...) — mêmes libellés
// i18n que les puces de filtre (t.search.typeHouse etc.), pas de nouvelles clés à dupliquer.
export const PROPERTY_TYPE_LABEL_KEY: Record<PropertyType, 'typeHouse' | 'typeApartment' | 'typeVilla' | 'typeLand'> = {
  house: 'typeHouse',
  apartment: 'typeApartment',
  villa: 'typeVilla',
  land: 'typeLand',
};

// Libellés courts injectés directement dans la carte de résultat (pas de i18n ici volontairement,
// même choix que le mobile — texte généré, pas un libellé d'UI isolé).
function waterSourceLabel(source: WaterSource): string {
  if (source === 'jirama') return 'eau JIRAMA';
  if (source === 'well') return 'eau de puits';
  return "accès à l'eau";
}

function legalStatusLabel(status: LandStatus): string {
  if (status === 'titled') return 'titre borné';
  if (status === 'cadastre') return 'cadastre';
  if (status === 'fitanolorana') return 'fitanolorana';
  return 'situation juridique à préciser';
}

function roomTypeLabel(roomType: string): string {
  return roomType.replace('plus', '+');
}

// Jusqu'à 2 caractéristiques courtes affichées sur la carte de résultat — port simplifié de
// Onina-mobile/src/features/listings/utils/listing-summary.ts:getKeyFeatures (adapté pour lire
// une annonce déjà publiée plutôt qu'un formulaire en cours de saisie).
export function getKeyFeatures(property: Property): string[] {
  switch (property.propertyType) {
    case 'house': {
      const features: string[] = [];
      features.push(`${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`);
      if (property.hasCarAccess) features.push('accès voiture');
      features.push(waterSourceLabel(property.waterSource));
      return features.slice(0, 2);
    }
    case 'villa':
    case 'apartment': {
      const features = [roomTypeLabel(property.roomType), `${property.surfaceM2} m²`];
      if (property.isFurnished) features.push('meublée');
      return features.slice(0, 2);
    }
    case 'land': {
      const features = [legalStatusLabel(property.legalStatus)];
      if (property.isBuildReady) features.push('prêt à bâtir');
      return features.slice(0, 2);
    }
    default:
      return [];
  }
}
