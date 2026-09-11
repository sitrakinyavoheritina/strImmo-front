import type { LandStatus, PropertyFormValues } from '@/features/search/types/listing.types';

// Libellés courts (pas de i18n ici volontairement : ce texte est injecté dans un titre/résumé
// généré, pas affiché isolément dans l'UI) — port de
// Onina-mobile/src/features/listings/utils/listing-summary.ts.
function waterSourceLabel(source: 'jirama' | 'well' | 'other'): string {
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

// Jusqu'à 5 caractéristiques courtes, par ordre d'importance décroissante — `generateTitle`/
// `generateCoverSummary` en prennent respectivement les 2 et 3 premières.
export function getKeyFeatures(values: PropertyFormValues): string[] {
  switch (values.propertyType) {
    case 'house': {
      const features: string[] = [];
      if (values.bedrooms > 0) {
        features.push(`${values.bedrooms} chambre${values.bedrooms > 1 ? 's' : ''}`);
      }
      if (values.hasCarAccess) features.push('accès voiture');
      if (values.hasMotorbikeAccess) features.push('accès moto');
      features.push(waterSourceLabel(values.waterSource));
      if (values.hasIndividualMeter) features.push('compteur individuel');
      return features;
    }
    case 'villa':
    case 'apartment': {
      const features = [roomTypeLabel(values.roomType)];
      if (values.surfaceM2 > 0) features.push(`${values.surfaceM2} m²`);
      if (values.parkingSpots > 0) {
        features.push(`${values.parkingSpots} parking${values.parkingSpots > 1 ? 's' : ''}`);
      }
      if (values.isFurnished) features.push('meublée');
      if (values.hasComfort) features.push('haut standing');
      if (values.hasCaretakerAnnex) features.push('dépendance');
      return features;
    }
    case 'land': {
      const features = [legalStatusLabel(values.legalStatus)];
      if (values.hasCarAccess) features.push('accès voiture');
      if (values.isResidentialArea) features.push('quartier résidentiel');
      if (values.hasWaterAvailable) features.push('eau disponible');
      if (values.hasElectricityAvailable) features.push('électricité disponible');
      if (values.isBuildReady) features.push('prêt à bâtir');
      return features;
    }
    default:
      return [];
  }
}

const TYPE_LABEL: Record<PropertyFormValues['propertyType'], string> = {
  house: 'Maison',
  villa: 'Villa',
  apartment: 'Appartement',
  land: 'Terrain',
};

// "Maison T3 avec accès voiture et eau JIRAMA" — 2 caractéristiques max, jointes par "et".
export function generateTitle(values: PropertyFormValues): string {
  const typeLabel = TYPE_LABEL[values.propertyType];
  const isResidential = values.propertyType === 'villa' || values.propertyType === 'apartment';
  const roomHint = isResidential ? ` ${roomTypeLabel(values.roomType)}` : '';
  const allFeatures = getKeyFeatures(values);
  const features = isResidential ? allFeatures.slice(1, 3) : allFeatures.slice(0, 2);
  const suffix = features.length > 0 ? ` avec ${features.join(' et ')}` : '';
  return `${typeLabel}${roomHint}${suffix}`.trim();
}

// "Villa T4 • 150 m² • 4 parkings • Meublée" — jusqu'à 3 caractéristiques, jointes par " • ".
export function generateCoverSummary(values: PropertyFormValues): string {
  const typeLabel = TYPE_LABEL[values.propertyType];
  const features = getKeyFeatures(values).slice(0, 3);
  return [typeLabel, ...features].join(' • ');
}
