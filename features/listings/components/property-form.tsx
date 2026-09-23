'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { Chip, Toggle, FieldLabel, FormInput } from '@/components/ui/form-controls';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ListingPhotoPicker } from './listing-photo-picker';
import { MapPositionPicker } from './map-position-picker';
import { generateTitle } from '../utils/listing-summary';
import { useCommunes } from '../hooks/use-communes';
import { useFokontany } from '../hooks/use-fokontany';
import { useGeocodeFokontany } from '../hooks/use-geocode-fokontany';
import type {
  BathroomLocation,
  LandPriceType,
  LandStatus,
  ListingKind,
  PropertyFormValues,
  PropertyType,
  RoomType,
  WaterSource,
} from '@/features/search/types/listing.types';

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 8;
const DESCRIPTION_MAX_LENGTH = 200;

// Prix (Ariary) et surface (m²) doivent rester des nombres entiers — ni l'un ni l'autre ne
// s'utilise avec une décimale dans la pratique (l'ariary n'a pas de sous-unité courante), et
// `surfaceM2` est de toute façon stockée en `int` côté base (voir land-details.entity.ts,
// residential-details.entity.ts). `FormInput` rend un simple champ texte (voir form-controls.tsx),
// rien n'empêchait avant de taper une décimale ou une lettre — filtré ici au clavier plutôt que
// juste validé à la soumission, pour ne jamais laisser un caractère invalide s'afficher.
function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}
const ROOM_TYPES: RoomType[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6plus'];
// Chambres (Maison) — mêmes boutons que le nombre de pièces d'une Villa/Appartement (ROOM_TYPES
// ci-dessus), demandé explicitement plutôt qu'un champ texte libre. `bedrooms` reste un nombre
// simple côté données (pas un enum comme `roomType`) : "6+" soumet directement 6, il n'existe pas
// de représentation "6 ou plus" à part entière.
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6];
const PROPERTY_TYPES: { value: PropertyType; labelKey: 'typeHouse' | 'typeApartment' | 'typeVilla' | 'typeLand' }[] = [
  { value: 'house', labelKey: 'typeHouse' },
  { value: 'land', labelKey: 'typeLand' },
  { value: 'apartment', labelKey: 'typeApartment' },
  { value: 'villa', labelKey: 'typeVilla' },
];

type FormErrors = Partial<
  Record<
    | 'title'
    | 'description'
    | 'price'
    | 'commune'
    | 'fokontany'
    | 'bedrooms'
    | 'surfaceM2'
    | 'minSubdivisionM2',
    string
  >
>;

export type PropertyFormHandle = { submit: () => void };

type PropertyFormProps = {
  /** 1 = type de bien (louer/acheter, maison/terrain/...), 2 = localisation (commune/fokontany/
   *  carte/adresse), photos et prix, 3 = détails (champs spécifiques au type de bien, titre,
   *  description). Un seul composant monté pour les trois étapes — l'état de tous les champs est
   *  conservé en allant/venant (voir app/annonce/nouvelle/page.tsx). */
  step: 1 | 2 | 3;
  onNext: () => void;
  onPreview: (values: PropertyFormValues, photos: File[]) => void;
  /** Pré-remplit le formulaire au retour depuis l'aperçu via "Modifier". */
  initialValues?: PropertyFormValues;
  initialPhotos?: File[];
  /** 'edit' réutilise exactement la même interface que la création (demandé explicitement,
   *  plutôt qu'un formulaire de modification distinct) mais verrouille ce qui n'est pas
   *  modifiable une fois l'annonce publiée : le type de bien (voir
   *  strImmo/src/properties/properties.service.ts:update, qui rejette tout changement) et les
   *  photos (route de modification en JSON, pas en multipart — voir update-property.dto.ts). */
  mode?: 'create' | 'edit';
};

// Formulaire de création d'annonce en 2 étapes suivies d'une prévisualisation, port de
// Onina-mobile/src/components/forms/property-form.tsx. Les champs de l'étape 2 dépendent du
// `propertyType` choisi à l'étape 1. Expose `submit()` via ref pour que le pied de page fixe de
// l'écran parent déclenche la validation de l'étape courante sans dupliquer l'état du formulaire.
export const PropertyForm = forwardRef<PropertyFormHandle, PropertyFormProps>(function PropertyForm(
  { step, onNext, onPreview, initialValues, initialPhotos, mode = 'create' },
  ref
) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  // Commission/caution : jamais pour un propriétaire, obligatoires pour un intermédiaire/une
  // agence — même règle appliquée côté serveur (strImmo/src/properties/properties.service.ts).
  const requiresCommission = user?.role === 'agent' || user?.role === 'agency';

  const [kind, setKind] = useState<ListingKind>(initialValues?.kind ?? 'rent');
  const [propertyType, setPropertyType] = useState<PropertyType>(initialValues?.propertyType ?? 'house');
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [isTitleEditing, setIsTitleEditing] = useState(Boolean(initialValues?.title));
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [price, setPrice] = useState(initialValues ? String(initialValues.price) : '');
  const [commission, setCommission] = useState(
    initialValues?.commission !== undefined ? String(initialValues.commission) : ''
  );
  const [caution, setCaution] = useState(
    initialValues?.caution !== undefined ? String(initialValues.caution) : ''
  );
  // Facultatif même pour intermédiaire/agence (contrairement à commission/caution ci-dessus,
  // obligatoires pour eux) — jamais de validation "requis" associée, voir plus bas.
  const [visitFee, setVisitFee] = useState(
    initialValues?.visitFee !== undefined ? String(initialValues.visitFee) : ''
  );
  // Localisation précise (commune → fokontany → position sur la carte) — remplace l'ancien champ
  // texte libre. `location` (le texte affichable "<fokontany>, <commune>") n'est plus saisi
  // directement : calculé ci-dessous pour l'aperçu, recalculé côté serveur à la publication (voir
  // property-mapper.ts, strImmo/src/properties/properties.service.ts:resolveLocation).
  const [communeId, setCommuneId] = useState(initialValues?.communeId);
  const [fokontanyId, setFokontanyId] = useState(initialValues?.fokontanyId);
  const [address, setAddress] = useState(initialValues?.address ?? '');
  // Autre numéro à contacter pour cette annonce précise — préremplie avec le contact secondaire
  // du compte (réglages du profil) s'il y en a un, modifiable ici sans toucher ce réglage de
  // compte (voir strImmo/src/properties/properties.service.ts:create, même valeur par défaut
  // appliquée côté serveur si ce champ est laissé tel quel). Reste vide si l'annonce éditée en a
  // explicitement un autre (ou aucun) — `initialValues` prime toujours sur la valeur du compte.
  const [phone2, setPhone2] = useState(initialValues?.phone2 ?? user?.phone2 ?? '');
  const [latitude, setLatitude] = useState(initialValues?.latitude);
  const [longitude, setLongitude] = useState(initialValues?.longitude);
  const [photos, setPhotos] = useState<File[]>(initialPhotos ?? []);
  // Disponibilité — toujours disponible à la création ; en édition, aucune bascule dans ce
  // formulaire (voir le bouton dédié sur la fiche détail), la valeur existante est simplement
  // reconduite telle quelle.
  const [available] = useState(initialValues?.available ?? true);

  const { data: communes } = useCommunes();
  const { data: fokontanyList } = useFokontany(communeId);
  const communeName = communes?.find((commune) => commune.id === communeId)?.name;
  const fokontanyName = fokontanyList?.find((fokontany) => fokontany.id === fokontanyId)?.name;
  const { data: geocodeHint } = useGeocodeFokontany(fokontanyName, communeName);
  const location = fokontanyName && communeName ? `${fokontanyName}, ${communeName}` : '';

  // Choisir une autre commune vide le fokontany déjà choisi (n'appartient plus forcément à la
  // nouvelle commune) — jamais déclenché par le pré-remplissage initial (voir `initialValues`
  // ci-dessus), seulement par un vrai changement fait par l'utilisateur.
  function handleCommuneChange(id: string) {
    setCommuneId(id);
    setFokontanyId(undefined);
    clearError('commune');
  }

  const houseDefaults = initialValues?.propertyType === 'house' ? initialValues : undefined;
  const landDefaults = initialValues?.propertyType === 'land' ? initialValues : undefined;
  const residentialDefaults =
    initialValues?.propertyType === 'villa' || initialValues?.propertyType === 'apartment' ? initialValues : undefined;

  // Maison
  const [bedrooms, setBedrooms] = useState(houseDefaults ? String(houseDefaults.bedrooms) : '');
  const [hasMotorbikeAccess, setHasMotorbikeAccess] = useState(houseDefaults?.hasMotorbikeAccess ?? false);
  const [waterSource, setWaterSource] = useState<WaterSource>(houseDefaults?.waterSource ?? 'jirama');
  const [bathroomLocation, setBathroomLocation] = useState<BathroomLocation>(
    houseDefaults?.bathroomLocation ?? 'interior'
  );
  const [hasIndividualMeter, setHasIndividualMeter] = useState(houseDefaults?.hasIndividualMeter ?? false);
  // Partagé Maison + Terrain (jamais affichés en même temps).
  const [hasCarAccess, setHasCarAccess] = useState(houseDefaults?.hasCarAccess ?? landDefaults?.hasCarAccess ?? false);

  // Villa / Appartement / Terrain (surface partagée par les trois — jamais affichés en même
  // temps, même logique que `hasCarAccess` partagé Maison + Terrain juste au-dessus).
  const [surfaceM2, setSurfaceM2] = useState(
    residentialDefaults
      ? String(residentialDefaults.surfaceM2)
      : landDefaults
        ? String(landDefaults.surfaceM2)
        : ''
  );
  // Un seul gestionnaire pour les deux champs "Surface" (Villa/Appartement et Terrain, jamais
  // affichés en même temps — voir plus bas) : mêmes deux lignes de chaque côté, évite de dupliquer
  // le filtre `onlyDigits`.
  function handleSurfaceM2Change(value: string) {
    setSurfaceM2(onlyDigits(value));
    clearError('surfaceM2');
  }
  const [isIndependent, setIsIndependent] = useState(residentialDefaults?.isIndependent ?? false);
  const [roomType, setRoomType] = useState<RoomType>(residentialDefaults?.roomType ?? 'T3');
  const [parkingSpots, setParkingSpots] = useState(residentialDefaults ? String(residentialDefaults.parkingSpots) : '');
  const [isFurnished, setIsFurnished] = useState(residentialDefaults?.isFurnished ?? false);
  const [hasComfort, setHasComfort] = useState(residentialDefaults?.hasComfort ?? false);
  const [hasCaretakerAnnex, setHasCaretakerAnnex] = useState(residentialDefaults?.hasCaretakerAnnex ?? false);

  // Terrain
  const [legalStatus, setLegalStatus] = useState<LandStatus>(landDefaults?.legalStatus ?? 'titled');
  const [isResidentialArea, setIsResidentialArea] = useState(landDefaults?.isResidentialArea ?? false);
  const [hasWaterAvailable, setHasWaterAvailable] = useState(landDefaults?.hasWaterAvailable ?? false);
  const [hasElectricityAvailable, setHasElectricityAvailable] = useState(landDefaults?.hasElectricityAvailable ?? false);
  const [isBuildReady, setIsBuildReady] = useState(landDefaults?.isBuildReady ?? false);
  const [isLotissement, setIsLotissement] = useState(landDefaults?.isLotissement ?? false);
  const [priceType, setPriceType] = useState<LandPriceType>(landDefaults?.priceType ?? 'per_m2');
  const [isSubdivisible, setIsSubdivisible] = useState(landDefaults?.isSubdivisible ?? false);
  const [minSubdivisionM2, setMinSubdivisionM2] = useState(
    landDefaults?.minSubdivisionM2 !== undefined ? String(landDefaults.minSubdivisionM2) : ''
  );

  const [errors, setErrors] = useState<FormErrors>({});
  function clearError(key: keyof FormErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function buildValues(): PropertyFormValues {
    const common = {
      title,
      description,
      price: Number(price) || 0,
      kind,
      location,
      communeId,
      fokontanyId,
      address: address.trim() || undefined,
      phone2: phone2.trim() || undefined,
      latitude,
      longitude,
      photoUrls: mode === 'edit' ? (initialValues?.photoUrls ?? []) : [],
      available,
      // Commission réservée à intermédiaire/agence (jamais un propriétaire, une commission
      // rémunère une intermédiation) ; caution et droit de visite, eux, concernent tout le monde
      // désormais — un propriétaire loue aussi contre une caution — remonté explicitement. Les
      // trois sont facultatifs (0 par défaut, jamais bloquant), plus aucun n'est "obligatoire".
      commission: requiresCommission ? Number(commission) || 0 : undefined,
      caution: Number(caution) || 0,
      visitFee: Number(visitFee) || 0,
    };

    if (propertyType === 'house') {
      return {
        ...common,
        propertyType,
        bedrooms: Number(bedrooms) || 0,
        hasCarAccess,
        hasMotorbikeAccess,
        waterSource,
        bathroomLocation,
        hasIndividualMeter,
      };
    }
    if (propertyType === 'land') {
      return {
        ...common,
        propertyType,
        legalStatus,
        hasCarAccess,
        isResidentialArea,
        hasWaterAvailable,
        hasElectricityAvailable,
        isBuildReady,
        isLotissement,
        priceType,
        surfaceM2: Number(surfaceM2) || 0,
        isSubdivisible,
        minSubdivisionM2: isSubdivisible ? Number(minSubdivisionM2) || 0 : undefined,
      };
    }
    return {
      ...common,
      propertyType,
      surfaceM2: Number(surfaceM2) || 0,
      isIndependent,
      roomType,
      parkingSpots: Number(parkingSpots) || 0,
      isFurnished,
      hasComfort,
      hasCaretakerAnnex,
    };
  }

  // Titre généré en direct à chaque rendu à partir des autres champs, affiché tant que
  // l'utilisateur n'a pas ouvert l'éditeur (crayon).
  const autoTitle = generateTitle(buildValues());
  const displayedTitle = isTitleEditing ? title : autoTitle;

  function startEditingTitle() {
    setTitle(autoTitle);
    setIsTitleEditing(true);
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!displayedTitle.trim()) next.title = t.listing.titleRequired;
    if (!description.trim()) next.description = t.listing.descriptionRequired;
    if (!price || Number(price) <= 0) next.price = t.listing.priceRequired;
    if (!communeId) next.commune = t.listing.communeRequired;
    if (!fokontanyId) next.fokontany = t.listing.fokontanyRequired;
    if (propertyType === 'house' && (!bedrooms || Number(bedrooms) <= 0)) next.bedrooms = t.listing.bedroomsRequired;
    if (
      (propertyType === 'villa' || propertyType === 'apartment' || propertyType === 'land') &&
      (!surfaceM2 || Number(surfaceM2) <= 0)
    ) {
      next.surfaceM2 = t.listing.surfaceRequired;
    }
    if (propertyType === 'land' && isSubdivisible && (!minSubdivisionM2 || Number(minSubdivisionM2) <= 0)) {
      next.minSubdivisionM2 = t.listing.minSubdivisionRequired;
    }
    return next;
  }

  function validateStep1(): FormErrors {
    const next: FormErrors = {};
    if (!price || Number(price) <= 0) next.price = t.listing.priceRequired;
    return next;
  }

  function handleNext1() {
    const nextErrors = validateStep1();
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0 || (mode === 'create' && photos.length < MIN_PHOTOS)) return;
    onNext();
  }

  function validateStep2(): FormErrors {
    const next: FormErrors = {};
    if (!communeId) next.commune = t.listing.communeRequired;
    if (!fokontanyId) next.fokontany = t.listing.fokontanyRequired;
    return next;
  }

  // Étape 2 (localisation) : la position sur la carte a toujours une valeur par défaut (voir
  // MapPositionPicker) et l'adresse est facultative — seuls commune/fokontany sont requis ici.
  function handleNext2() {
    const nextErrors = validateStep2();
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0) return;
    onNext();
  }

  function handlePreview() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || (mode === 'create' && photos.length < MIN_PHOTOS)) return;
    onPreview({ ...buildValues(), title: displayedTitle }, photos);
  }

  useImperativeHandle(ref, () => ({
    submit: step === 1 ? handleNext1 : step === 2 ? handleNext2 : handlePreview,
  }));

  return (
    <div className="space-y-4">
      {step === 1 && (
        <>
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

          <div>
            <FieldLabel>{t.search.propertyType}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(({ value, labelKey }) => (
                <Chip
                  key={value}
                  active={propertyType === value}
                  onClick={() => mode === 'create' && setPropertyType(value)}
                >
                  {t.search[labelKey]}
                </Chip>
              ))}
            </div>
            {mode === 'edit' && <p className="mt-1 text-[12px] text-content-muted">{t.listing.propertyTypeImmutable}</p>}
          </div>

          {propertyType === 'land' && (
            <div>
              <FieldLabel>{t.listing.priceTypeLabel}</FieldLabel>
              <div className="flex gap-2">
                <Chip active={priceType === 'total'} onClick={() => setPriceType('total')}>
                  {t.listing.priceTypeTotal}
                </Chip>
                <Chip active={priceType === 'per_m2'} onClick={() => setPriceType('per_m2')}>
                  {t.listing.priceTypePerM2}
                </Chip>
              </div>
            </div>
          )}

          <FormInput
            label={
              propertyType === 'land'
                ? priceType === 'per_m2'
                  ? t.listing.pricePerSqm
                  : t.listing.priceTypeTotal
                : kind === 'rent'
                  ? t.listing.rentLabel
                  : t.listing.priceLabel
            }
            value={price}
            onChange={(value) => {
              setPrice(onlyDigits(value));
              clearError('price');
            }}
            placeholder="0"
            type="number"
            suffix="Ar"
            error={errors.price}
          />

          {/* Côte à côte pour économiser de la place — demandé explicitement. */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label={t.listing.caution}
              value={caution}
              onChange={(value) => setCaution(onlyDigits(value))}
              placeholder="0"
              type="number"
              suffix="Ar"
            />
            <FormInput
              label={t.listing.visitFee}
              value={visitFee}
              onChange={(value) => setVisitFee(onlyDigits(value))}
              placeholder="0"
              type="number"
              suffix="Ar"
            />
          </div>

          {/* Commission côte à côte avec le contact 2 — réservée à intermédiaire/agence (rémunère
              une intermédiation, n'a pas de sens pour un propriétaire qui traite en direct),
              contrairement à caution et droit de visite juste au-dessus, désormais communs à
              tout le monde. Aucun des trois n'est obligatoire (0 par défaut si laissé vide, voir
              buildValues plus haut). */}
          <div className={requiresCommission ? 'grid grid-cols-2 gap-3' : ''}>
            <FormInput
              label={t.listing.formPhone2}
              value={phone2}
              onChange={setPhone2}
              placeholder={t.listing.formPhone2Placeholder}
            />
            {requiresCommission && (
              <FormInput
                label={t.listing.commission}
                value={commission}
                onChange={(value) => setCommission(onlyDigits(value))}
                placeholder="0"
                type="number"
                suffix="Ar"
              />
            )}
          </div>

          {mode === 'edit' ? (
            <div>
              <FieldLabel>{t.listing.photos}</FieldLabel>
              <div className="flex gap-2 overflow-x-auto scroll-touch">
                {(initialValues?.photoUrls ?? []).map((url) => (
                  <div
                    key={url}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border border-stroke-default"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniature déjà hébergée, pas besoin d'optimisation ici */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-content-muted">{t.listing.photosImmutableNotice}</p>
            </div>
          ) : (
            <ListingPhotoPicker photos={photos} onChange={setPhotos} min={MIN_PHOTOS} max={MAX_PHOTOS} />
          )}
        </>
      )}

      {step === 2 && (
        <>
          {/* Ville/Commune → Fokontany → carte → adresse, tous les champs de localisation
              regroupés dans la même étape, dans cet ordre. */}
          <SearchableSelect
            label={t.listing.formCommune}
            value={communeId}
            onChange={handleCommuneChange}
            options={(communes ?? []).map((commune) => ({
              id: commune.id,
              label: commune.name,
              sublabel: commune.district,
            }))}
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
        </>
      )}

      {step === 3 && propertyType === 'house' && (
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

      {step === 3 && (propertyType === 'apartment' || propertyType === 'villa') && (
        <ResidentialFields
          propertyType={propertyType}
          surfaceM2={surfaceM2}
          setSurfaceM2={handleSurfaceM2Change}
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

      {step === 3 && propertyType === 'land' && (
        <LandFields
          surfaceM2={surfaceM2}
          setSurfaceM2={handleSurfaceM2Change}
          surfaceM2Error={errors.surfaceM2}
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
          isLotissement={isLotissement}
          setIsLotissement={setIsLotissement}
          isSubdivisible={isSubdivisible}
          setIsSubdivisible={setIsSubdivisible}
          minSubdivisionM2={minSubdivisionM2}
          setMinSubdivisionM2={(v) => {
            setMinSubdivisionM2(onlyDigits(v));
            clearError('minSubdivisionM2');
          }}
          minSubdivisionM2Error={errors.minSubdivisionM2}
        />
      )}

      {step === 3 && (
        <>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>{t.listing.formTitle}</FieldLabel>
              {!isTitleEditing && (
                <button
                  type="button"
                  onClick={startEditingTitle}
                  aria-label={t.listing.editTitle}
                  className="text-content-muted hover:text-brand-primary transition"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
            {isTitleEditing ? (
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearError('title');
                }}
                placeholder={t.listing.formTitlePlaceholder}
                className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
                  errors.title ? 'border-danger' : 'border-stroke-default'
                }`}
              />
            ) : (
              <p className="px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main">
                {displayedTitle}
              </p>
            )}
            {errors.title && <p className="mt-1 text-[0.85rem] text-danger">{errors.title}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>{t.listing.formDescription}</FieldLabel>
              <span className="text-[0.85rem] text-content-muted">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH));
                clearError('description');
              }}
              placeholder={t.listing.formDescriptionPlaceholder}
              rows={4}
              maxLength={DESCRIPTION_MAX_LENGTH}
              className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none ${
                errors.description ? 'border-danger' : 'border-stroke-default'
              }`}
            />
            {errors.description && <p className="mt-1 text-[0.85rem] text-danger">{errors.description}</p>}
          </div>
        </>
      )}
    </div>
  );
});

type HouseFieldsProps = {
  bedrooms: string;
  setBedrooms: (value: string) => void;
  bedroomsError?: string;
  hasCarAccess: boolean;
  setHasCarAccess: (value: boolean) => void;
  hasMotorbikeAccess: boolean;
  setHasMotorbikeAccess: (value: boolean) => void;
  waterSource: WaterSource;
  setWaterSource: (value: WaterSource) => void;
  bathroomLocation: BathroomLocation;
  setBathroomLocation: (value: BathroomLocation) => void;
  hasIndividualMeter: boolean;
  setHasIndividualMeter: (value: boolean) => void;
};

export function HouseFields({
  bedrooms,
  setBedrooms,
  bedroomsError,
  hasCarAccess,
  setHasCarAccess,
  hasMotorbikeAccess,
  setHasMotorbikeAccess,
  waterSource,
  setWaterSource,
  bathroomLocation,
  setBathroomLocation,
  hasIndividualMeter,
  setHasIndividualMeter,
}: HouseFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div>
        <FieldLabel>{t.listing.bedroomsCount}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((count, index) => (
            <Chip key={count} active={Number(bedrooms) === count} onClick={() => setBedrooms(String(count))}>
              {index === BEDROOM_OPTIONS.length - 1 ? `${count}+` : String(count)}
            </Chip>
          ))}
        </div>
        {bedroomsError && <p className="mt-1 text-[0.85rem] text-danger">{bedroomsError}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Toggle label={t.search.carAccess} checked={hasCarAccess} onChange={setHasCarAccess} />
        <Toggle label={t.search.hasMotorbikeAccess} checked={hasMotorbikeAccess} onChange={setHasMotorbikeAccess} />
      </div>
      <div>
        <FieldLabel>{t.search.waterSource}</FieldLabel>
        <div className="flex gap-2">
          <Chip active={waterSource === 'jirama'} onClick={() => setWaterSource('jirama')}>{t.search.jirama}</Chip>
          <Chip active={waterSource === 'well'} onClick={() => setWaterSource('well')}>{t.search.well}</Chip>
          <Chip active={waterSource === 'other'} onClick={() => setWaterSource('other')}>{t.search.other}</Chip>
        </div>
      </div>
      <div>
        <FieldLabel>{t.search.bathroomLocation}</FieldLabel>
        <div className="flex gap-2">
          <Chip active={bathroomLocation === 'interior'} onClick={() => setBathroomLocation('interior')}>{t.search.interior}</Chip>
          <Chip active={bathroomLocation === 'exterior'} onClick={() => setBathroomLocation('exterior')}>{t.search.exterior}</Chip>
        </div>
      </div>
      <Toggle label={t.search.hasIndividualMeter} checked={hasIndividualMeter} onChange={setHasIndividualMeter} />
    </div>
  );
}

type ResidentialFieldsProps = {
  propertyType: 'villa' | 'apartment';
  surfaceM2: string;
  setSurfaceM2: (value: string) => void;
  surfaceM2Error?: string;
  isIndependent: boolean;
  setIsIndependent: (value: boolean) => void;
  roomType: RoomType;
  setRoomType: (value: RoomType) => void;
  parkingSpots: string;
  setParkingSpots: (value: string) => void;
  isFurnished: boolean;
  setIsFurnished: (value: boolean) => void;
  hasComfort: boolean;
  setHasComfort: (value: boolean) => void;
  hasCaretakerAnnex: boolean;
  setHasCaretakerAnnex: (value: boolean) => void;
};

export function ResidentialFields({
  propertyType,
  surfaceM2,
  setSurfaceM2,
  surfaceM2Error,
  isIndependent,
  setIsIndependent,
  roomType,
  setRoomType,
  parkingSpots,
  setParkingSpots,
  isFurnished,
  setIsFurnished,
  hasComfort,
  setHasComfort,
  hasCaretakerAnnex,
  setHasCaretakerAnnex,
}: ResidentialFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <FormInput label={t.listing.surface} value={surfaceM2} onChange={setSurfaceM2} placeholder="0" type="number" suffix="m²" error={surfaceM2Error} />
      <Toggle
        label={propertyType === 'villa' ? t.search.villaIndependent : t.search.apartmentIndependent}
        checked={isIndependent}
        onChange={setIsIndependent}
      />
      <div>
        <FieldLabel>{t.search.roomTypeLabel}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => (
            <Chip key={type} active={roomType === type} onClick={() => setRoomType(type)}>
              {type.replace('plus', '+')}
            </Chip>
          ))}
        </div>
      </div>
      <FormInput label={t.search.parkingSpots} value={parkingSpots} onChange={setParkingSpots} placeholder="0" type="number" />
      <div className="flex flex-wrap gap-2">
        <Chip active={isFurnished} onClick={() => setIsFurnished(!isFurnished)}>{t.search.isFurnished}</Chip>
        <Chip active={hasComfort} onClick={() => setHasComfort(!hasComfort)}>{t.search.comfort}</Chip>
      </div>
      <Toggle label={t.search.hasCaretakerAnnex} checked={hasCaretakerAnnex} onChange={setHasCaretakerAnnex} />
    </div>
  );
}

type LandFieldsProps = {
  surfaceM2: string;
  setSurfaceM2: (value: string) => void;
  surfaceM2Error?: string;
  legalStatus: LandStatus;
  setLegalStatus: (value: LandStatus) => void;
  hasCarAccess: boolean;
  setHasCarAccess: (value: boolean) => void;
  isResidentialArea: boolean;
  setIsResidentialArea: (value: boolean) => void;
  hasWaterAvailable: boolean;
  setHasWaterAvailable: (value: boolean) => void;
  hasElectricityAvailable: boolean;
  setHasElectricityAvailable: (value: boolean) => void;
  isBuildReady: boolean;
  setIsBuildReady: (value: boolean) => void;
  isLotissement: boolean;
  setIsLotissement: (value: boolean) => void;
  isSubdivisible: boolean;
  setIsSubdivisible: (value: boolean) => void;
  minSubdivisionM2: string;
  setMinSubdivisionM2: (value: string) => void;
  minSubdivisionM2Error?: string;
};

const LAND_STATUSES: { value: LandStatus; labelKey: 'legalStatusTitled' | 'legalStatusCadastre' | 'legalStatusFitanolorana' | 'other' }[] = [
  { value: 'titled', labelKey: 'legalStatusTitled' },
  { value: 'cadastre', labelKey: 'legalStatusCadastre' },
  { value: 'fitanolorana', labelKey: 'legalStatusFitanolorana' },
  { value: 'other', labelKey: 'other' },
];

export function LandFields({
  surfaceM2,
  setSurfaceM2,
  surfaceM2Error,
  legalStatus,
  setLegalStatus,
  hasCarAccess,
  setHasCarAccess,
  isResidentialArea,
  setIsResidentialArea,
  hasWaterAvailable,
  setHasWaterAvailable,
  hasElectricityAvailable,
  setHasElectricityAvailable,
  isBuildReady,
  setIsBuildReady,
  isLotissement,
  setIsLotissement,
  isSubdivisible,
  setIsSubdivisible,
  minSubdivisionM2,
  setMinSubdivisionM2,
  minSubdivisionM2Error,
}: LandFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <FormInput
        label={t.listing.surface}
        value={surfaceM2}
        onChange={setSurfaceM2}
        placeholder="0"
        type="number"
        suffix="m²"
        error={surfaceM2Error}
      />
      <div>
        <FieldLabel>{t.search.legalStatus}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {LAND_STATUSES.map(({ value, labelKey }) => (
            <Chip key={value} active={legalStatus === value} onClick={() => setLegalStatus(value)}>
              {t.search[labelKey]}
            </Chip>
          ))}
        </div>
      </div>
      <Toggle label={t.search.carAccess} checked={hasCarAccess} onChange={setHasCarAccess} />
      <Toggle label={t.search.isResidentialArea} checked={isResidentialArea} onChange={setIsResidentialArea} />
      <Toggle label={t.search.hasWaterAvailable} checked={hasWaterAvailable} onChange={setHasWaterAvailable} />
      <Toggle label={t.search.hasElectricityAvailable} checked={hasElectricityAvailable} onChange={setHasElectricityAvailable} />
      <Toggle label={t.search.isBuildReady} checked={isBuildReady} onChange={setIsBuildReady} />
      <Toggle label={t.search.isLotissement} checked={isLotissement} onChange={setIsLotissement} />
      <Toggle label={t.search.isSubdivisible} checked={isSubdivisible} onChange={setIsSubdivisible} />
      {isSubdivisible && (
        <FormInput
          label={t.listing.minSubdivision}
          value={minSubdivisionM2}
          onChange={setMinSubdivisionM2}
          placeholder="0"
          type="number"
          suffix="m²"
          error={minSubdivisionM2Error}
        />
      )}
    </div>
  );
}
