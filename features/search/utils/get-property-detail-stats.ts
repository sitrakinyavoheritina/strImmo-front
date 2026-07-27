import {
  Ruler,
  BedDouble,
  Home,
  Car,
  Bike,
  Droplet,
  Bath,
  Zap,
  Sofa,
  Sparkles,
  Building2,
  Landmark,
  CheckCircle2,
  LayoutGrid,
  Scissors,
  type LucideIcon,
} from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import type { Property, PropertyFormValues } from '../types/listing.types';

export type Stat = { icon: LucideIcon; value: string; label: string };
export type Amenity = { icon: LucideIcon; text: string };

const WATER_SOURCE_LABEL_KEY = { jirama: 'jirama', well: 'well', other: 'other' } as const;
const LEGAL_STATUS_LABEL_KEY = {
  titled: 'legalStatusTitled',
  cadastre: 'legalStatusCadastre',
  fitanolorana: 'legalStatusFitanolorana',
  other: 'other',
} as const;

// Caractéristiques (icône + valeur) et équipements affichés sur la fiche détail publiée
// (app/annonce/[id]/page.tsx) — factorisé ici pour que l'aperçu avant publication
// (listing-preview.tsx) affiche exactement le même rendu à partir des valeurs du formulaire en
// cours plutôt que d'une annonce déjà enregistrée. Les deux types partagent les mêmes noms de
// champs (`PropertyFormValues` = `Property` moins quelques champs calculés côté serveur), donc la
// même logique s'applique aux deux sans dupliquer quoi que ce soit.
export function getPropertyDetailStats(
  property: Property | PropertyFormValues,
  t: Translations
): { stats: Stat[]; amenities: Amenity[] } {
  const stats: Stat[] = [];
  const amenities: Amenity[] = [];

  if (property.propertyType === 'house') {
    stats.push({ icon: BedDouble, value: String(property.bedrooms), label: t.propertyDetail.bedroomsLabel });
    if (property.hasCarAccess) amenities.push({ icon: Car, text: t.search.carAccess });
    if (property.hasMotorbikeAccess) amenities.push({ icon: Bike, text: t.search.hasMotorbikeAccess });
    amenities.push({ icon: Droplet, text: t.search[WATER_SOURCE_LABEL_KEY[property.waterSource]] });
    amenities.push({ icon: Bath, text: property.bathroomLocation === 'interior' ? t.search.interior : t.search.exterior });
    if (property.hasIndividualMeter) amenities.push({ icon: Zap, text: t.search.hasIndividualMeter });
  } else if (property.propertyType === 'villa' || property.propertyType === 'apartment') {
    stats.push({ icon: Ruler, value: `${property.surfaceM2} m²`, label: t.propertyDetail.areaLabel });
    stats.push({ icon: Home, value: property.roomType.replace('plus', '+'), label: t.search.roomTypeLabel });
    if (property.parkingSpots > 0) {
      stats.push({ icon: Car, value: String(property.parkingSpots), label: t.search.parkingSpots });
    }
    if (property.isIndependent) {
      amenities.push({
        icon: Home,
        text: property.propertyType === 'villa' ? t.search.villaIndependent : t.search.apartmentIndependent,
      });
    }
    if (property.isFurnished) amenities.push({ icon: Sofa, text: t.search.isFurnished });
    if (property.hasComfort) amenities.push({ icon: Sparkles, text: t.search.comfort });
    if (property.hasCaretakerAnnex) amenities.push({ icon: Building2, text: t.search.hasCaretakerAnnex });
  } else {
    stats.push({ icon: Ruler, value: `${property.surfaceM2} m²`, label: t.propertyDetail.areaLabel });
    amenities.push({ icon: Landmark, text: t.search[LEGAL_STATUS_LABEL_KEY[property.legalStatus]] });
    if (property.hasCarAccess) amenities.push({ icon: Car, text: t.search.carAccess });
    if (property.isResidentialArea) amenities.push({ icon: Home, text: t.search.isResidentialArea });
    if (property.hasWaterAvailable) amenities.push({ icon: Droplet, text: t.search.hasWaterAvailable });
    if (property.hasElectricityAvailable) amenities.push({ icon: Zap, text: t.search.hasElectricityAvailable });
    if (property.isBuildReady) amenities.push({ icon: CheckCircle2, text: t.search.isBuildReady });
    if (property.isLotissement) amenities.push({ icon: LayoutGrid, text: t.search.isLotissement });
    if (property.isSubdivisible) {
      amenities.push({
        icon: Scissors,
        text: property.minSubdivisionM2
          ? `${t.search.isSubdivisible} (min ${property.minSubdivisionM2} m²)`
          : t.search.isSubdivisible,
      });
    }
  }

  return { stats, amenities };
}
