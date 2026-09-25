'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { PropertyFilters } from '../types/listing.types';

const TYPE_LABEL_KEY = {
  house: 'typeHouse',
  apartment: 'typeApartment',
  villa: 'typeVilla',
  land: 'typeLand',
} as const;

const PUBLISHER_LABEL_KEY = {
  owner: 'publisherOwner',
  agent: 'publisherAgent',
  agency: 'publisherAgency',
} as const;

const LAND_STATUS_LABEL_KEY = {
  titled: 'legalStatusTitled',
  cadastre: 'legalStatusCadastre',
  fitanolorana: 'legalStatusFitanolorana',
  other: 'other',
} as const;

/** Pills des filtres actifs, retirables — mêmes clés que le modal (voir mobile ActiveFilterChips). */
export function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: PropertyFilters;
  onRemove: (key: keyof PropertyFilters) => void;
}) {
  const { t } = useTranslation();

  const chips: { key: keyof PropertyFilters; label: string }[] = [];
  if (filters.kind) chips.push({ key: 'kind', label: filters.kind === 'rent' ? t.search.rent : t.search.buy });
  if (filters.propertyType) {
    chips.push({ key: 'propertyType', label: t.search[TYPE_LABEL_KEY[filters.propertyType]] });
  }
  if (filters.location) chips.push({ key: 'location', label: filters.location });
  if (filters.minPrice !== undefined) {
    chips.push({ key: 'minPrice', label: `${t.search.minPrice} : ${filters.minPrice.toLocaleString('fr-FR')} Ar` });
  }
  if (filters.maxPrice !== undefined) {
    chips.push({ key: 'maxPrice', label: `${t.search.maxPrice} : ${filters.maxPrice.toLocaleString('fr-FR')} Ar` });
  }
  if (filters.publisherType) {
    chips.push({ key: 'publisherType', label: t.search[PUBLISHER_LABEL_KEY[filters.publisherType]] });
  }
  if (filters.minBedrooms !== undefined) {
    chips.push({ key: 'minBedrooms', label: `${filters.minBedrooms}+ ${t.search.bedroomsMin}` });
  }
  if (filters.noCommission) chips.push({ key: 'noCommission', label: t.search.noCommission });
  if (filters.noCaution) chips.push({ key: 'noCaution', label: t.search.noCaution });
  if (filters.noVisitFee) chips.push({ key: 'noVisitFee', label: t.search.noVisitFee });
  if (filters.hasComfort) chips.push({ key: 'hasComfort', label: t.search.comfort });
  if (filters.hasCarAccess) chips.push({ key: 'hasCarAccess', label: t.search.carAccess });
  if (filters.bathroomLocation) {
    chips.push({
      key: 'bathroomLocation',
      label: filters.bathroomLocation === 'interior' ? t.search.interior : t.search.exterior,
    });
  }
  if (filters.waterSource) {
    chips.push({
      key: 'waterSource',
      label: filters.waterSource === 'jirama' ? t.search.jirama : filters.waterSource === 'well' ? t.search.well : t.search.other,
    });
  }
  // Maison
  if (filters.hasMotorbikeAccess) chips.push({ key: 'hasMotorbikeAccess', label: t.search.hasMotorbikeAccess });
  if (filters.hasIndividualMeter) chips.push({ key: 'hasIndividualMeter', label: t.search.hasIndividualMeter });
  // Villa / Appartement
  if (filters.isIndependent) {
    chips.push({
      key: 'isIndependent',
      label: filters.propertyType === 'apartment' ? t.search.apartmentIndependent : t.search.villaIndependent,
    });
  }
  if (filters.roomType) {
    chips.push({ key: 'roomType', label: filters.roomType.replace('plus', '+') });
  }
  if (filters.minParkingSpots !== undefined) {
    chips.push({ key: 'minParkingSpots', label: `${filters.minParkingSpots}+ ${t.search.parkingSpots}` });
  }
  if (filters.isFurnished) chips.push({ key: 'isFurnished', label: t.search.isFurnished });
  if (filters.hasCaretakerAnnex) chips.push({ key: 'hasCaretakerAnnex', label: t.search.hasCaretakerAnnex });
  // Terrain
  if (filters.legalStatus) {
    chips.push({ key: 'legalStatus', label: t.search[LAND_STATUS_LABEL_KEY[filters.legalStatus]] });
  }
  if (filters.isResidentialArea) chips.push({ key: 'isResidentialArea', label: t.search.isResidentialArea });
  if (filters.hasWaterAvailable) chips.push({ key: 'hasWaterAvailable', label: t.search.hasWaterAvailable });
  if (filters.hasElectricityAvailable) {
    chips.push({ key: 'hasElectricityAvailable', label: t.search.hasElectricityAvailable });
  }
  if (filters.isBuildReady) chips.push({ key: 'isBuildReady', label: t.search.isBuildReady });

  if (chips.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scroll-touch pb-1">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="flex items-center gap-1.5 shrink-0 bg-brand-primary-soft text-brand-primary text-[0.85rem] font-semibold px-3 py-1.5 rounded-full hover:bg-stroke-default transition"
        >
          {chip.label}
          <X size={12} />
        </button>
      ))}
    </div>
  );
}
