'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useUpdateProperty } from '@/features/search/hooks/use-update-property';
import { FieldLabel, FormInput } from '@/components/ui/form-controls';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { MapPositionPicker } from './map-position-picker';
import { HouseFields, ResidentialFields, LandFields } from './property-form';
import { useCommunes } from '../hooks/use-communes';
import { useFokontany } from '../hooks/use-fokontany';
import { useGeocodeFokontany } from '../hooks/use-geocode-fokontany';
import { PROPERTY_TYPE_LABEL_KEY } from '@/features/search/utils/get-key-features';
import type { Property, PropertyFormValues } from '@/features/search/types/listing.types';

type FormErrors = Partial<Record<'title' | 'description' | 'price' | 'commune' | 'fokontany' | 'bedrooms' | 'surfaceM2', string>>;

/** Formulaire de modification d'une annonce déjà publiée — pas de photos (la route de
 * modification ne les gère pas, voir strImmo/src/properties/dto/update-property.dto.ts) ni de
 * changement de type de bien (immuable une fois créé), contrairement au formulaire de création
 * (property-form.tsx) dont ce composant réutilise les champs spécifiques par type (HouseFields/
 * ResidentialFields/LandFields) pour ne pas les dupliquer. Une seule page, pas d'étapes : moins de
 * champs qu'à la création (pas de photos), pas besoin de les répartir. */
export function EditPropertyForm({ property }: { property: Property }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: updateProperty, isPending, error } = useUpdateProperty();

  const [kind, setKind] = useState(property.kind);
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [price, setPrice] = useState(String(property.price));
  const [communeId, setCommuneId] = useState(property.communeId);
  const [fokontanyId, setFokontanyId] = useState(property.fokontanyId);
  const [address, setAddress] = useState(property.address ?? '');
  const [latitude, setLatitude] = useState(property.latitude);
  const [longitude, setLongitude] = useState(property.longitude);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: communes } = useCommunes();
  const { data: fokontanyList } = useFokontany(communeId);
  const communeName = communes?.find((commune) => commune.id === communeId)?.name;
  const fokontanyName = fokontanyList?.find((fokontany) => fokontany.id === fokontanyId)?.name;
  const { data: geocodeHint } = useGeocodeFokontany(fokontanyName, communeName);

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleCommuneChange(id: string) {
    setCommuneId(id);
    setFokontanyId(undefined);
    clearError('commune');
  }

  // Maison
  const [bedrooms, setBedrooms] = useState(property.propertyType === 'house' ? String(property.bedrooms) : '');
  const [hasMotorbikeAccess, setHasMotorbikeAccess] = useState(
    property.propertyType === 'house' ? property.hasMotorbikeAccess : false
  );
  const [waterSource, setWaterSource] = useState(property.propertyType === 'house' ? property.waterSource : 'jirama');
  const [bathroomLocation, setBathroomLocation] = useState(
    property.propertyType === 'house' ? property.bathroomLocation : 'interior'
  );
  const [hasIndividualMeter, setHasIndividualMeter] = useState(
    property.propertyType === 'house' ? property.hasIndividualMeter : false
  );
  // Partagé Maison + Terrain (jamais affichés en même temps).
  const [hasCarAccess, setHasCarAccess] = useState(
    property.propertyType === 'house' || property.propertyType === 'land' ? property.hasCarAccess : false
  );

  // Villa / Appartement
  const isResidential = property.propertyType === 'villa' || property.propertyType === 'apartment';
  const [surfaceM2, setSurfaceM2] = useState(isResidential ? String(property.surfaceM2) : '');
  const [isIndependent, setIsIndependent] = useState(isResidential ? property.isIndependent : false);
  const [roomType, setRoomType] = useState(isResidential ? property.roomType : 'T3');
  const [parkingSpots, setParkingSpots] = useState(isResidential ? String(property.parkingSpots) : '');
  const [isFurnished, setIsFurnished] = useState(isResidential ? property.isFurnished : false);
  const [hasComfort, setHasComfort] = useState(isResidential ? property.hasComfort : false);
  const [hasCaretakerAnnex, setHasCaretakerAnnex] = useState(isResidential ? property.hasCaretakerAnnex : false);

  // Terrain
  const [legalStatus, setLegalStatus] = useState(property.propertyType === 'land' ? property.legalStatus : 'titled');
  const [isResidentialArea, setIsResidentialArea] = useState(
    property.propertyType === 'land' ? property.isResidentialArea : false
  );
  const [hasWaterAvailable, setHasWaterAvailable] = useState(
    property.propertyType === 'land' ? property.hasWaterAvailable : false
  );
  const [hasElectricityAvailable, setHasElectricityAvailable] = useState(
    property.propertyType === 'land' ? property.hasElectricityAvailable : false
  );
  const [isBuildReady, setIsBuildReady] = useState(property.propertyType === 'land' ? property.isBuildReady : false);

  function buildValues(): PropertyFormValues {
    const common = {
      title,
      description,
      price: Number(price) || 0,
      kind,
      location: property.location,
      communeId,
      fokontanyId,
      address: address.trim() || undefined,
      latitude,
      longitude,
      photoUrls: property.photoUrls,
      available: property.available,
    };

    if (property.propertyType === 'house') {
      return {
        ...common,
        propertyType: 'house',
        bedrooms: Number(bedrooms) || 0,
        hasCarAccess,
        hasMotorbikeAccess,
        waterSource,
        bathroomLocation,
        hasIndividualMeter,
      };
    }
    if (property.propertyType === 'land') {
      return {
        ...common,
        propertyType: 'land',
        legalStatus,
        hasCarAccess,
        isResidentialArea,
        hasWaterAvailable,
        hasElectricityAvailable,
        isBuildReady,
      };
    }
    return {
      ...common,
      propertyType: property.propertyType,
      surfaceM2: Number(surfaceM2) || 0,
      isIndependent,
      roomType,
      parkingSpots: Number(parkingSpots) || 0,
      isFurnished,
      hasComfort,
      hasCaretakerAnnex,
    };
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!title.trim()) next.title = t.listing.titleRequired;
    if (!description.trim()) next.description = t.listing.descriptionRequired;
    if (!price || Number(price) <= 0) next.price = t.listing.priceRequired;
    if (!communeId) next.commune = t.listing.communeRequired;
    if (!fokontanyId) next.fokontany = t.listing.fokontanyRequired;
    if (property.propertyType === 'house' && (!bedrooms || Number(bedrooms) <= 0)) next.bedrooms = t.listing.bedroomsRequired;
    if (isResidential && (!surfaceM2 || Number(surfaceM2) <= 0)) next.surfaceM2 = t.listing.surfaceRequired;
    return next;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    updateProperty(
      { id: property.id, values: buildValues() },
      { onSuccess: () => router.push(`/annonce/${property.id}`) }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <FormErrorBanner message={t.listing.editError} />
      )}

      <div>
        <FieldLabel>{t.search.propertyType}</FieldLabel>
        <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-app border border-stroke-default text-content-main">
          {t.search[PROPERTY_TYPE_LABEL_KEY[property.propertyType]]}
        </span>
        <p className="mt-1 text-[11px] text-content-muted">{t.listing.propertyTypeImmutable}</p>
      </div>

      <div className="flex rounded-xl border border-stroke-default overflow-hidden">
        <button
          type="button"
          onClick={() => setKind('rent')}
          className={`flex-1 py-2.5 text-sm font-semibold transition ${
            kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
          }`}
        >
          {t.search.rent}
        </button>
        <button
          type="button"
          onClick={() => setKind('sale')}
          className={`flex-1 py-2.5 text-sm font-semibold transition border-l border-stroke-default ${
            kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
          }`}
        >
          {t.search.buy}
        </button>
      </div>

      <FormInput
        label={t.listing.formTitle}
        value={title}
        onChange={(value) => {
          setTitle(value);
          clearError('title');
        }}
        error={errors.title}
      />

      <div>
        <FieldLabel>{t.listing.formDescription}</FieldLabel>
        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value.slice(0, 200));
            clearError('description');
          }}
          rows={4}
          maxLength={200}
          className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none ${
            errors.description ? 'border-danger' : 'border-stroke-default'
          }`}
        />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
      </div>

      <FormInput
        label={property.propertyType === 'land' ? t.listing.pricePerSqm : kind === 'rent' ? t.listing.rentLabel : t.listing.priceLabel}
        value={price}
        onChange={(value) => {
          setPrice(value);
          clearError('price');
        }}
        type="number"
        suffix="Ar"
        error={errors.price}
      />

      <SearchableSelect
        label={t.listing.formCommune}
        value={communeId}
        onChange={handleCommuneChange}
        options={(communes ?? []).map((commune) => ({ id: commune.id, label: commune.name, sublabel: commune.district }))}
        placeholder={t.listing.formCommunePlaceholder}
        searchPlaceholder={t.listing.communeSearchPlaceholder}
        emptyMessage={t.listing.communeEmptyMessage}
        error={errors.commune}
      />

      <SearchableSelect
        label={t.listing.formFokontany}
        value={fokontanyId}
        onChange={(id) => {
          setFokontanyId(id);
          clearError('fokontany');
        }}
        options={(fokontanyList ?? []).map((fokontany) => ({ id: fokontany.id, label: fokontany.name }))}
        placeholder={communeId ? t.listing.formFokontanyPlaceholder : t.listing.formFokontanyDisabledPlaceholder}
        searchPlaceholder={t.listing.fokontanySearchPlaceholder}
        emptyMessage={t.listing.fokontanyEmptyMessage}
        disabled={!communeId}
        error={errors.fokontany}
      />

      <MapPositionPicker
        latitude={latitude}
        longitude={longitude}
        onChange={({ latitude: lat, longitude: lng }) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
        centerHintLatitude={geocodeHint?.latitude}
        centerHintLongitude={geocodeHint?.longitude}
        address={address}
        onAddressChange={setAddress}
      />

      {property.propertyType === 'house' && (
        <HouseFields
          bedrooms={bedrooms}
          setBedrooms={(v) => {
            setBedrooms(v);
            clearError('bedrooms');
          }}
          bedroomsError={errors.bedrooms}
          hasCarAccess={hasCarAccess}
          setHasCarAccess={setHasCarAccess}
          hasMotorbikeAccess={hasMotorbikeAccess}
          setHasMotorbikeAccess={setHasMotorbikeAccess}
          waterSource={waterSource}
          setWaterSource={setWaterSource}
          bathroomLocation={bathroomLocation}
          setBathroomLocation={setBathroomLocation}
          hasIndividualMeter={hasIndividualMeter}
          setHasIndividualMeter={setHasIndividualMeter}
        />
      )}

      {isResidential && (
        <ResidentialFields
          propertyType={property.propertyType as 'villa' | 'apartment'}
          surfaceM2={surfaceM2}
          setSurfaceM2={(v) => {
            setSurfaceM2(v);
            clearError('surfaceM2');
          }}
          surfaceM2Error={errors.surfaceM2}
          isIndependent={isIndependent}
          setIsIndependent={setIsIndependent}
          roomType={roomType}
          setRoomType={setRoomType}
          parkingSpots={parkingSpots}
          setParkingSpots={setParkingSpots}
          isFurnished={isFurnished}
          setIsFurnished={setIsFurnished}
          hasComfort={hasComfort}
          setHasComfort={setHasComfort}
          hasCaretakerAnnex={hasCaretakerAnnex}
          setHasCaretakerAnnex={setHasCaretakerAnnex}
        />
      )}

      {property.propertyType === 'land' && (
        <LandFields
          legalStatus={legalStatus}
          setLegalStatus={setLegalStatus}
          hasCarAccess={hasCarAccess}
          setHasCarAccess={setHasCarAccess}
          isResidentialArea={isResidentialArea}
          setIsResidentialArea={setIsResidentialArea}
          hasWaterAvailable={hasWaterAvailable}
          setHasWaterAvailable={setHasWaterAvailable}
          hasElectricityAvailable={hasElectricityAvailable}
          setHasElectricityAvailable={setHasElectricityAvailable}
          isBuildReady={isBuildReady}
          setIsBuildReady={setIsBuildReady}
        />
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t.listing.saving : t.listing.saveChanges}
      </Button>
    </form>
  );
}
