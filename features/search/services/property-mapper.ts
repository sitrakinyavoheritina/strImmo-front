import type { ApiProperty } from './property-api';
import type {
  ApartmentProperty,
  HouseProperty,
  LandProperty,
  Property,
  PropertyFormValues,
  VillaProperty,
} from '../types/listing.types';

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
    mainPhotoUrl: cover?.url,
    photoUrls: [...api.photos].sort((a, b) => a.position - b.position).map((photo) => photo.url),
    ownerId: api.user?.id ?? '',
    createdAt: api.createdAt,
    available: api.available,
    moderationStatus: api.moderationStatus,
    rejectionReason: api.rejectionReason ?? undefined,
    phone2: api.phone2 ?? undefined,
    commission: api.commission != null ? Number(api.commission) : undefined,
    caution: api.caution != null ? Number(api.caution) : undefined,
    viewCount: api.viewCount,
    authorName:
      api.user?.firstName || api.user?.lastName
        ? [api.user.firstName, api.user.lastName].filter(Boolean).join(' ')
        : undefined,
    authorAvatarUrl: api.user?.avatarUrl ?? undefined,
    publisherType: api.user?.role,
    contactPhone: api.user?.phone,
    favoritesCount: api.favoritesCount,
    likesCount: api.likesCount,
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
  form.append('location', values.location);
  if (values.phone2) form.append('phone2', values.phone2);
  if (values.commission !== undefined) form.append('commission', String(values.commission));
  if (values.caution !== undefined) form.append('caution', String(values.caution));

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
  }

  const [cover, ...gallery] = photos;
  form.append('cover', cover);
  for (const photo of gallery) form.append('images', photo);

  return form;
}
