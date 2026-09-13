'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { Chip, Toggle, FieldLabel, Section } from '@/components/ui/form-controls';
import { hasActiveAdvancedFilters } from '../utils/has-active-advanced-filters';
import type { PropertyFilters, PropertyType, PublisherType, RoomType, LandStatus } from '../types/listing.types';

export const PROPERTY_TYPES: { value: PropertyType; labelKey: 'typeHouse' | 'typeApartment' | 'typeVilla' | 'typeLand' }[] = [
  { value: 'house', labelKey: 'typeHouse' },
  { value: 'apartment', labelKey: 'typeApartment' },
  { value: 'villa', labelKey: 'typeVilla' },
  { value: 'land', labelKey: 'typeLand' },
];

export const ROOM_TYPES: RoomType[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6plus'];
export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
export const LAND_STATUSES: { value: LandStatus; labelKey: 'legalStatusTitled' | 'legalStatusCadastre' | 'legalStatusFitanolorana' | 'other' }[] = [
  { value: 'titled', labelKey: 'legalStatusTitled' },
  { value: 'cadastre', labelKey: 'legalStatusCadastre' },
  { value: 'fitanolorana', labelKey: 'legalStatusFitanolorana' },
  { value: 'other', labelKey: 'other' },
];
// Repère indicatif affiché en placeholder — le budget médian diffère fortement entre location et
// vente, un même "ex: 500 000" n'aurait aucun sens pour les deux (même logique que le mobile).
export const PRICE_CEILING = { rent: 6_000_000, sale: 700_000_000 };

export const PUBLISHER_TYPES: { value: PublisherType; labelKey: 'publisherOwner' | 'publisherAgent' | 'publisherAgency' }[] = [
  { value: 'owner', labelKey: 'publisherOwner' },
  { value: 'agent', labelKey: 'publisherAgent' },
  { value: 'agency', labelKey: 'publisherAgency' },
];

export const SORT_OPTIONS: { value: NonNullable<PropertyFilters['sortBy']>; labelKey: 'sortRecent' | 'sortPriceAsc' | 'sortPriceDesc' | 'sortPopular' }[] = [
  { value: 'recent', labelKey: 'sortRecent' },
  { value: 'price_asc', labelKey: 'sortPriceAsc' },
  { value: 'price_desc', labelKey: 'sortPriceDesc' },
  { value: 'popular', labelKey: 'sortPopular' },
];

export type FilterFieldsProps = {
  draft: PropertyFilters;
  onUpdate: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  onSelectPropertyType: (value: PropertyType | undefined) => void;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  /** 'full' (défaut, `FilterModal`) : tous les champs. 'compact' (`SidebarAdvancedFilters`) :
   *  sans location/vente, type de bien, prix et publié par — déjà visibles sur la barre de
   *  recherche de l'accueil, inutile de les répéter ; ne garde que le nombre de chambres min et
   *  la section dépliable spécifique au type de bien sélectionné. */
  mode?: 'full' | 'compact';
};

/** Les champs de filtre eux-mêmes (type, localisation, prix, publieur, avancé par type de bien) —
 * séparés de leur habillage (modal plein écran vs section fixe dans la sidebar) pour ne pas
 * dupliquer cette longue liste entre `FilterModal` et `SidebarAdvancedFilters`. */
export function FilterFields({ draft, onUpdate, onSelectPropertyType, isAdvancedOpen, onToggleAdvanced, mode = 'full' }: FilterFieldsProps) {
  const { t } = useTranslation();
  const priceCeiling = draft.kind === 'sale' ? PRICE_CEILING.sale : PRICE_CEILING.rent;

  return (
    <>
      {mode === 'full' && (
        <>
          <Section>
            <div className="flex rounded-xl border border-stroke-default overflow-hidden">
              <button
                type="button"
                onClick={() => onUpdate('kind', draft.kind === 'rent' ? undefined : 'rent')}
                className={`flex-1 py-2.5 text-sm font-semibold transition ${
                  draft.kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.rent}
              </button>
              <button
                type="button"
                onClick={() => onUpdate('kind', draft.kind === 'sale' ? undefined : 'sale')}
                className={`flex-1 py-2.5 text-sm font-semibold transition border-l border-stroke-default ${
                  draft.kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.buy}
              </button>
            </div>
          </Section>

          <Section>
            <div>
              <FieldLabel>{t.search.neighborhood}</FieldLabel>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  value={draft.location ?? ''}
                  onChange={(event) => onUpdate('location', event.target.value || undefined)}
                  placeholder={t.search.neighborhoodPlaceholder}
                  className="w-full rounded-xl border border-stroke-default pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <FieldLabel>{t.search.propertyType}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <Chip active={!draft.propertyType} onClick={() => onSelectPropertyType(undefined)}>
                  {t.search.allTypes}
                </Chip>
                {PROPERTY_TYPES.map(({ value, labelKey }) => (
                  <Chip key={value} active={draft.propertyType === value} onClick={() => onSelectPropertyType(value)}>
                    {t.search[labelKey]}
                  </Chip>
                ))}
              </div>
            </div>
          </Section>

          <Section>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>{t.search.minPrice}</FieldLabel>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={draft.minPrice ?? ''}
                  onChange={(event) => onUpdate('minPrice', event.target.value ? Number(event.target.value) : undefined)}
                  className="w-full rounded-xl border border-stroke-default px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <FieldLabel>{t.search.maxPrice}</FieldLabel>
                <input
                  type="number"
                  min={0}
                  placeholder={priceCeiling.toLocaleString('fr-FR')}
                  value={draft.maxPrice ?? ''}
                  onChange={(event) => onUpdate('maxPrice', event.target.value ? Number(event.target.value) : undefined)}
                  className="w-full rounded-xl border border-stroke-default px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </Section>

          <Section>
            <div>
              <FieldLabel>{t.search.publisherType}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <Chip active={!draft.publisherType} onClick={() => onUpdate('publisherType', undefined)}>
                  {t.search.allPublishers}
                </Chip>
                {PUBLISHER_TYPES.map(({ value, labelKey }) => (
                  <Chip
                    key={value}
                    active={draft.publisherType === value}
                    onClick={() => onUpdate('publisherType', draft.publisherType === value ? undefined : value)}
                  >
                    {t.search[labelKey]}
                  </Chip>
                ))}
              </div>
            </div>
          </Section>
        </>
      )}

      {draft.propertyType === 'house' && (
        <Section>
          <div>
            <FieldLabel>{t.search.bedroomsMin}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_OPTIONS.map((value) => (
                <Chip
                  key={value}
                  active={draft.minBedrooms === value}
                  onClick={() => onUpdate('minBedrooms', draft.minBedrooms === value ? undefined : value)}
                >
                  {value === 6 ? '6+' : value}
                </Chip>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section>
        <button
          type="button"
          onClick={onToggleAdvanced}
          className="w-full flex items-center justify-between text-sm font-semibold text-content-main"
        >
          <span className="flex items-center gap-1.5">
            {t.search.moreCriteria}
            {hasActiveAdvancedFilters(draft) && <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />}
          </span>
          <ChevronDown size={18} className={`text-content-muted transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </button>

        {isAdvancedOpen && (
          <div className="space-y-2.5">
            {!draft.propertyType && (
              <Toggle
                label={t.search.carAccess}
                checked={!!draft.hasCarAccess}
                onChange={(v) => onUpdate('hasCarAccess', v || undefined)}
              />
            )}

            {draft.propertyType === 'house' && (
              <>
                <Toggle
                  label={t.search.carAccess}
                  checked={!!draft.hasCarAccess}
                  onChange={(v) => onUpdate('hasCarAccess', v || undefined)}
                />
                <Toggle
                  label={t.search.hasMotorbikeAccess}
                  checked={!!draft.hasMotorbikeAccess}
                  onChange={(v) => onUpdate('hasMotorbikeAccess', v || undefined)}
                />
                <div>
                  <FieldLabel>{t.search.waterSource}</FieldLabel>
                  <div className="flex gap-2">
                    <Chip active={draft.waterSource === 'jirama'} onClick={() => onUpdate('waterSource', draft.waterSource === 'jirama' ? undefined : 'jirama')}>
                      {t.search.jirama}
                    </Chip>
                    <Chip active={draft.waterSource === 'well'} onClick={() => onUpdate('waterSource', draft.waterSource === 'well' ? undefined : 'well')}>
                      {t.search.well}
                    </Chip>
                    <Chip active={draft.waterSource === 'other'} onClick={() => onUpdate('waterSource', draft.waterSource === 'other' ? undefined : 'other')}>
                      {t.search.other}
                    </Chip>
                  </div>
                </div>
                <div>
                  <FieldLabel>{t.search.bathroomLocation}</FieldLabel>
                  <div className="flex gap-2">
                    <Chip active={draft.bathroomLocation === 'interior'} onClick={() => onUpdate('bathroomLocation', draft.bathroomLocation === 'interior' ? undefined : 'interior')}>
                      {t.search.interior}
                    </Chip>
                    <Chip active={draft.bathroomLocation === 'exterior'} onClick={() => onUpdate('bathroomLocation', draft.bathroomLocation === 'exterior' ? undefined : 'exterior')}>
                      {t.search.exterior}
                    </Chip>
                  </div>
                </div>
                <Toggle
                  label={t.search.hasIndividualMeter}
                  checked={!!draft.hasIndividualMeter}
                  onChange={(v) => onUpdate('hasIndividualMeter', v || undefined)}
                />
              </>
            )}

            {(draft.propertyType === 'villa' || draft.propertyType === 'apartment') && (
              <>
                <Toggle
                  label={draft.propertyType === 'villa' ? t.search.villaIndependent : t.search.apartmentIndependent}
                  checked={!!draft.isIndependent}
                  onChange={(v) => onUpdate('isIndependent', v || undefined)}
                />
                <div>
                  <FieldLabel>{t.search.roomTypeLabel}</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_TYPES.map((room) => (
                      <Chip key={room} active={draft.roomType === room} onClick={() => onUpdate('roomType', draft.roomType === room ? undefined : room)}>
                        {room.replace('plus', '+')}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>{t.search.parkingSpots}</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={draft.minParkingSpots ?? ''}
                    onChange={(event) => onUpdate('minParkingSpots', event.target.value ? Number(event.target.value) : undefined)}
                    className="w-full rounded-xl border border-stroke-default px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <Toggle label={t.search.isFurnished} checked={!!draft.isFurnished} onChange={(v) => onUpdate('isFurnished', v || undefined)} />
                <Toggle label={t.search.comfort} checked={!!draft.hasComfort} onChange={(v) => onUpdate('hasComfort', v || undefined)} />
                <Toggle label={t.search.hasCaretakerAnnex} checked={!!draft.hasCaretakerAnnex} onChange={(v) => onUpdate('hasCaretakerAnnex', v || undefined)} />
              </>
            )}

            {draft.propertyType === 'land' && (
              <>
                <div>
                  <FieldLabel>{t.search.legalStatus}</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {LAND_STATUSES.map(({ value, labelKey }) => (
                      <Chip key={value} active={draft.legalStatus === value} onClick={() => onUpdate('legalStatus', draft.legalStatus === value ? undefined : value)}>
                        {t.search[labelKey]}
                      </Chip>
                    ))}
                  </div>
                </div>
                <Toggle label={t.search.carAccess} checked={!!draft.hasCarAccess} onChange={(v) => onUpdate('hasCarAccess', v || undefined)} />
                <Toggle label={t.search.isResidentialArea} checked={!!draft.isResidentialArea} onChange={(v) => onUpdate('isResidentialArea', v || undefined)} />
                <Toggle label={t.search.hasWaterAvailable} checked={!!draft.hasWaterAvailable} onChange={(v) => onUpdate('hasWaterAvailable', v || undefined)} />
                <Toggle label={t.search.hasElectricityAvailable} checked={!!draft.hasElectricityAvailable} onChange={(v) => onUpdate('hasElectricityAvailable', v || undefined)} />
                <Toggle label={t.search.isBuildReady} checked={!!draft.isBuildReady} onChange={(v) => onUpdate('isBuildReady', v || undefined)} />
              </>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
