import type { ApiProperty } from './property-api';
import type {
  ApartmentProperty,
  HouseProperty,
  LandProperty,
  ListingPhotoItem,
  Property,
  PropertyFormValues,
  VillaProperty,
} from '../types/listing.types';

// Ne garde que les fichiers locaux ("new") — en création, tous les items le sont déjà (voir
// property-form.tsx), ce filtre reste défensif plutôt qu'une simple assertion de type.
export function extractNewPhotoFiles(items: ListingPhotoItem[]): File[] {
  return items.filter((item): item is Extract<ListingPhotoItem, { kind: 'new' }> => item.kind === 'new').map((item) => item.file);
}

// Reconstitue l'union à plat `Property` à partir de la réponse imbriquée du backend (une
// sous-table de détails par type, une seule renseignée selon `propertyType`). Port direct de
// Onina-mobile/src/features/listings/utils/property-mapper.ts:mapApiPropertyToProperty.
export function mapApiPropertyToProperty(api: ApiProperty): Property {
  const cover = api.photos.find((photo) => photo.isCover) ?? api.photos[0];
  const base = {
    id: api.id,
    title: api.title,
    description: api.description,
    price: Number(api.price),
    kind: api.kind,
    location: api.location,
    communeId: api.commune?.id,
    communeName: api.commune?.name,
    fokontanyId: api.fokontany?.id,
    fokontanyName: api.fokontany?.name,
    address: api.address ?? undefined,
    latitude: api.latitude != null ? Number(api.latitude) : undefined,
    longitude: api.longitude != null ? Number(api.longitude) : undefined,
    mainPhotoUrl: cover?.url,
    photoUrls: [...api.photos].sort((a, b) => a.position - b.position).map((photo) => photo.url),
    ownerId: api.user?.id ?? '',
    createdAt: api.createdAt,
    available: api.available,
    moderationStatus: api.moderationStatus,
    rejectionReason: api.rejectionReason ?? undefined,
    phone2: api.phone2 ?? undefined,
    commissionPercent: api.commissionPercent ?? undefined,
    cautionPercent: api.cautionPercent ?? undefined,
    visitFee: api.visitFee != null ? Number(api.visitFee) : undefined,
    viewCount: api.viewCount,
    authorName:
      api.user?.firstName || api.user?.lastName
        ? [api.user.firstName, api.user.lastName].filter(Boolean).join(' ')
        : undefined,
    authorAvatarUrl: api.user?.avatarUrl ?? undefined,
    publisherType: api.user?.role,
    authorCreatedByAdmin: api.user?.createdByAdmin,
    contactPhone: api.user?.phone,
    favoritesCount: api.favoritesCount,
    likesCount: api.likesCount,
    moderatorName:
      api.moderatedBy?.firstName || api.moderatedBy?.lastName
        ? [api.moderatedBy.firstName, api.moderatedBy.lastName].filter(Boolean).join(' ')
        : undefined,
    createdByAdminId: api.createdByAdminId ?? undefined,
  };

  if (api.propertyType === 'house' && api.houseDetails) {
    return { ...base, propertyType: 'house', ...api.houseDetails } satisfies HouseProperty;
  }
  if ((api.propertyType === 'villa' || api.propertyType === 'apartment') && api.residentialDetails) {
    return {
      ...base,
      propertyType: api.propertyType,
      ...api.residentialDetails,
    } satisfies VillaProperty | ApartmentProperty;
  }
  if (api.propertyType === 'land' && api.landDetails) {
    return { ...base, propertyType: 'land', ...api.landDetails } satisfies LandProperty;
  }
  throw new Error(
    `Réponse API incohérente pour l'annonce ${api.id} : type "${api.propertyType}" sans détails associés.`,
  );
}

// Port de Onina-mobile/.../property-mapper.ts:buildCreatePropertyFormData — synchrone ici (pas de
// conversion URI→Blob nécessaire : les photos du picker web sont déjà des `File`, eux-mêmes des
// `Blob`, directement utilisables dans un FormData). `photos[0]` est toujours la couverture.
export function buildCreatePropertyFormData(values: PropertyFormValues, photos: File[]): FormData {
  const form = new FormData();
  form.append('propertyType', values.propertyType);
  form.append('kind', values.kind);
  form.append('title', values.title);
  form.append('description', values.description);
  form.append('price', String(values.price));
  // Nouveau parcours (commune/fokontany choisis dans le référentiel) : `location` est calculée
  // côté serveur, pas envoyée — voir strImmo/src/properties/properties.service.ts:resolveLocation.
  // `values.location` reste rempli côté formulaire uniquement pour l'aperçu avant publication
  // (listing-preview.tsx), jamais transmis ici.
  if (values.communeId) form.append('communeId', values.communeId);
  if (values.fokontanyId) form.append('fokontanyId', values.fokontanyId);
  if (values.address) form.append('address', values.address);
  if (values.latitude != null) form.append('latitude', String(values.latitude));
  if (values.longitude != null) form.append('longitude', String(values.longitude));
  if (values.phone2) form.append('phone2', values.phone2);
  if (values.commissionPercent !== undefined) form.append('commissionPercent', String(values.commissionPercent));
  if (values.cautionPercent !== undefined) form.append('cautionPercent', String(values.cautionPercent));
  if (values.visitFee !== undefined) form.append('visitFee', String(values.visitFee));

  if (values.propertyType === 'house') {
    form.append('bedrooms', String(values.bedrooms));
    form.append('hasCarAccess', String(values.hasCarAccess));
    form.append('hasMotorbikeAccess', String(values.hasMotorbikeAccess));
    form.append('waterSource', values.waterSource);
    form.append('bathroomLocation', values.bathroomLocation);
    form.append('hasIndividualMeter', String(values.hasIndividualMeter));
  } else if (values.propertyType === 'villa' || values.propertyType === 'apartment') {
    form.append('surfaceM2', String(values.surfaceM2));
    form.append('isIndependent', String(values.isIndependent));
    form.append('roomType', values.roomType);
    form.append('parkingSpots', String(values.parkingSpots));
    form.append('isFurnished', String(values.isFurnished));
    form.append('hasComfort', String(values.hasComfort));
    form.append('hasCaretakerAnnex', String(values.hasCaretakerAnnex));
  } else {
    form.append('legalStatus', values.legalStatus);
    form.append('hasCarAccess', String(values.hasCarAccess));
    form.append('isResidentialArea', String(values.isResidentialArea));
    form.append('hasWaterAvailable', String(values.hasWaterAvailable));
    form.append('hasElectricityAvailable', String(values.hasElectricityAvailable));
    form.append('isBuildReady', String(values.isBuildReady));
    form.append('isLotissement', String(values.isLotissement));
    form.append('priceType', values.priceType);
    form.append('surfaceM2', String(values.surfaceM2));
    form.append('isSubdivisible', String(values.isSubdivisible));
    if (values.minSubdivisionM2 != null) {
      form.append('minSubdivisionM2', String(values.minSubdivisionM2));
    }
  }

  const [cover, ...gallery] = photos;
  form.append('cover', cover);
  for (const photo of gallery) form.append('images', photo);

  return form;
}

// Port du sous-ensemble modifiable après publication (voir
// strImmo/src/properties/dto/update-property.dto.ts) — `propertyType` et les photos sont
// désormais modifiables eux aussi (demandé explicitement, ce n'était pas le cas avant), ce qui
// exige du multipart (comme buildCreatePropertyFormData) plutôt que le JSON classique d'avant :
// les nouvelles photos sont des fichiers, impossibles à envoyer en JSON.
export function buildUpdatePropertyFormData(values: PropertyFormValues, photos: ListingPhotoItem[]): FormData {
  const form = new FormData();
  form.append('propertyType', values.propertyType);
  form.append('kind', values.kind);
  form.append('title', values.title);
  form.append('description', values.description);
  form.append('price', String(values.price));
  form.append('available', String(values.available));
  if (values.communeId) form.append('communeId', values.communeId);
  if (values.fokontanyId) form.append('fokontanyId', values.fokontanyId);
  if (values.address) form.append('address', values.address);
  if (values.latitude != null) form.append('latitude', String(values.latitude));
  if (values.longitude != null) form.append('longitude', String(values.longitude));
  if (values.phone2) form.append('phone2', values.phone2);
  if (values.commissionPercent !== undefined) form.append('commissionPercent', String(values.commissionPercent));
  if (values.cautionPercent !== undefined) form.append('cautionPercent', String(values.cautionPercent));
  if (values.visitFee !== undefined) form.append('visitFee', String(values.visitFee));

  if (values.propertyType === 'house') {
    form.append('bedrooms', String(values.bedrooms));
    form.append('hasCarAccess', String(values.hasCarAccess));
    form.append('hasMotorbikeAccess', String(values.hasMotorbikeAccess));
    form.append('waterSource', values.waterSource);
    form.append('bathroomLocation', values.bathroomLocation);
    form.append('hasIndividualMeter', String(values.hasIndividualMeter));
  } else if (values.propertyType === 'villa' || values.propertyType === 'apartment') {
    form.append('surfaceM2', String(values.surfaceM2));
    form.append('isIndependent', String(values.isIndependent));
    form.append('roomType', values.roomType);
    form.append('parkingSpots', String(values.parkingSpots));
    form.append('isFurnished', String(values.isFurnished));
    form.append('hasComfort', String(values.hasComfort));
    form.append('hasCaretakerAnnex', String(values.hasCaretakerAnnex));
  } else {
    form.append('legalStatus', values.legalStatus);
    form.append('hasCarAccess', String(values.hasCarAccess));
    form.append('isResidentialArea', String(values.isResidentialArea));
    form.append('hasWaterAvailable', String(values.hasWaterAvailable));
    form.append('hasElectricityAvailable', String(values.hasElectricityAvailable));
    form.append('isBuildReady', String(values.isBuildReady));
    form.append('isLotissement', String(values.isLotissement));
    form.append('priceType', values.priceType);
    form.append('surfaceM2', String(values.surfaceM2));
    form.append('isSubdivisible', String(values.isSubdivisible));
    if (values.minSubdivisionM2 != null) {
      form.append('minSubdivisionM2', String(values.minSubdivisionM2));
    }
  }

  // Ordre final des photos, couverture = première entrée (voir strImmo/src/properties/dto/
  // update-property.dto.ts:photoOrder) — une photo déjà hébergée est référencée par son URL
  // (jamais retéléversée), une nouvelle par son index dans `newPhotos`, dans le même ordre que son
  // ajout ici, pour que le backend puisse faire correspondre les deux.
  const order: string[] = [];
  let newIndex = 0;
  for (const item of photos) {
    if (item.kind === 'existing') {
      order.push(`existing:${item.url}`);
    } else {
      order.push(`new:${newIndex}`);
      form.append('newPhotos', item.file);
      newIndex += 1;
    }
  }
  form.append('photoOrder', JSON.stringify(order));

  return form;
}
