import type { Locale } from '@/lib/i18n/use-translation';
import type { Translations } from '@/lib/i18n/translations';
import type { PropertyRequest } from '../types/property-request.types';

const FR_TYPE_ARTICLE: Record<string, string> = {
  house: 'une maison',
  apartment: 'un appartement',
  villa: 'une villa',
  land: 'un terrain',
};

const MG_TYPE_NOUN: Record<string, string> = {
  house: 'trano',
  apartment: 'trano fonenana',
  villa: 'villa',
  land: 'tany',
};

const FR_TYPE_LABEL: Record<string, string> = {
  house: 'Maison',
  apartment: 'Appartement',
  villa: 'Villa',
  land: 'Terrain',
};

const MG_TYPE_LABEL: Record<string, string> = {
  house: 'Trano',
  apartment: 'Trano fonenana',
  villa: 'Villa',
  land: 'Tany',
};

function formatAr(value: number): string {
  return Number(value).toLocaleString('fr-FR');
}

// Seuls ces champs sont nécessaires : `Pick`, pas `PropertyRequest` en entier, pour pouvoir
// aussi générer la phrase à partir du brouillon (state local) de app/demandes/nouvelle/page.tsx,
// avant même que la demande n'existe côté serveur.
type RequestLike = Pick<
  PropertyRequest,
  'kind' | 'propertyType' | 'communeName' | 'fokontanyName' | 'minBudget' | 'maxBudget' | 'rawDescription'
>;

// "à Ambohipo, Antananarivo" si le quartier est connu, sinon juste "à Antananarivo" — même ordre
// que `Property.location` ("<fokontany>, <commune>", voir PropertiesService.resolveLocation).
function zoneLabel(request: RequestLike): string | undefined {
  if (request.fokontanyName && request.communeName) return `${request.fokontanyName}, ${request.communeName}`;
  return request.communeName ?? undefined;
}

/** Court intitulé ("Appartement à louer", "Terrain à acheter"...) affiché en gras au-dessus de la
 *  phrase complète (voir requestSentence) sur les cartes de demande — repère visuel rapide avant
 *  de lire le détail, demandé pour rendre la liste plus scannable. */
export function requestTitle(request: RequestLike, locale: Locale): string {
  const type = request.propertyType;
  if (locale === 'mg') {
    const noun = type ? MG_TYPE_LABEL[type] : 'Fananana';
    const kind = request.kind === 'rent' ? 'hofaina' : 'hovidiana';
    return `Mitady ${noun} ${kind}`;
  }
  const label = type ? FR_TYPE_LABEL[type] : 'Bien';
  const kind = request.kind === 'rent' ? 'à louer' : 'à acheter';
  return `Cherche ${label} ${kind}`;
}

/** Transforme les critères structurés (+ le texte libre éventuel, voir CreatePropertyRequestDto.
 *  rawDescription) en une phrase lisible commençant par "Je cherche" — affichée à la place de la
 *  liste de critères bruts sur la carte "Mes demandes", le tableau public et le résumé avant
 *  création (my-request-card.tsx, public-board-card.tsx, app/demandes/nouvelle/page.tsx). Le
 *  texte libre n'est jamais traduit (c'est ce que la personne a tapé, dans sa langue) : seule
 *  l'introduction générée suit la langue de l'interface. */
export function requestSentence(request: RequestLike, locale: Locale): string {
  const type = request.propertyType;
  const place = zoneLabel(request);
  let intro: string;

  if (locale === 'mg') {
    const noun = type ? MG_TYPE_NOUN[type] : 'fananana';
    const kind = request.kind === 'rent' ? 'hofaina' : 'hovidiana';
    const zone = place ? ` any ${place}` : '';
    let budget = '';
    if (request.minBudget && request.maxBudget) {
      budget = `, eo anelanelan'ny ${formatAr(request.minBudget)} sy ${formatAr(request.maxBudget)} Ar`;
    } else if (request.maxBudget) {
      budget = `, hatramin'ny ${formatAr(request.maxBudget)} Ar`;
    } else if (request.minBudget) {
      budget = `, manomboka amin'ny ${formatAr(request.minBudget)} Ar`;
    }
    intro = `Mitady ${noun} ${kind} aho${zone}${budget}.`;
  } else {
    const article = type ? FR_TYPE_ARTICLE[type] : 'un bien';
    const kind = request.kind === 'rent' ? 'à louer' : 'à acheter';
    const zone = place ? ` à ${place}` : '';
    let budget = '';
    if (request.minBudget && request.maxBudget) {
      budget = `, pour un budget entre ${formatAr(request.minBudget)} et ${formatAr(request.maxBudget)} Ar`;
    } else if (request.maxBudget) {
      budget = `, pour un budget jusqu'à ${formatAr(request.maxBudget)} Ar`;
    } else if (request.minBudget) {
      budget = `, pour un budget à partir de ${formatAr(request.minBudget)} Ar`;
    }
    intro = `Je cherche ${article} ${kind}${zone}${budget}.`;
  }

  return request.rawDescription ? `${intro}\n${request.rawDescription}` : intro;
}

// Les 19 critères facultatifs de "Plus de critères" (voir app/demandes/nouvelle/page.tsx,
// FilterFields) ne sont repris nulle part dans `requestSentence` — la phrase resterait illisible
// si elle devait toutes les égrainer. Ils étaient de ce fait invisibles pour un vendeur parcourant
// le tableau, alors même que la personne les avait bien remplis à la création (ex. "sans
// commission") — remonté explicitement. `requestCriteriaLabels` les résume en courtes étiquettes,
// affichées sous la phrase par les cartes (my-request-card.tsx, public-board-card.tsx).
type RequestCriteriaLike = Pick<
  PropertyRequest,
  | 'propertyType'
  | 'noCommission'
  | 'noCaution'
  | 'noVisitFee'
  | 'hasCarAccess'
  | 'hasMotorbikeAccess'
  | 'waterSource'
  | 'bathroomLocation'
  | 'hasIndividualMeter'
  | 'isIndependent'
  | 'roomType'
  | 'minParkingSpots'
  | 'isFurnished'
  | 'hasComfort'
  | 'hasCaretakerAnnex'
  | 'legalStatus'
  | 'isResidentialArea'
  | 'hasWaterAvailable'
  | 'hasElectricityAvailable'
  | 'isBuildReady'
>;

export function requestCriteriaLabels(request: RequestCriteriaLike, t: Translations): string[] {
  const labels: string[] = [];
  if (request.noCommission) labels.push(t.search.noCommission);
  if (request.noCaution) labels.push(t.search.noCaution);
  if (request.noVisitFee) labels.push(t.search.noVisitFee);
  if (request.hasCarAccess) labels.push(t.search.carAccess);
  if (request.hasMotorbikeAccess) labels.push(t.search.hasMotorbikeAccess);
  if (request.waterSource === 'jirama') labels.push(t.search.jirama);
  if (request.waterSource === 'well') labels.push(t.search.well);
  if (request.waterSource === 'other') labels.push(t.search.other);
  if (request.bathroomLocation === 'interior') labels.push(t.search.interior);
  if (request.bathroomLocation === 'exterior') labels.push(t.search.exterior);
  if (request.hasIndividualMeter) labels.push(t.search.hasIndividualMeter);
  if (request.isIndependent) {
    labels.push(request.propertyType === 'villa' ? t.search.villaIndependent : t.search.apartmentIndependent);
  }
  if (request.roomType) labels.push(request.roomType.replace('plus', '+'));
  if (request.minParkingSpots) labels.push(`${t.search.parkingSpots} ${request.minParkingSpots}+`);
  if (request.isFurnished) labels.push(t.search.isFurnished);
  if (request.hasComfort) labels.push(t.search.comfort);
  if (request.hasCaretakerAnnex) labels.push(t.search.hasCaretakerAnnex);
  if (request.legalStatus === 'titled') labels.push(t.search.legalStatusTitled);
  if (request.legalStatus === 'cadastre') labels.push(t.search.legalStatusCadastre);
  if (request.legalStatus === 'fitanolorana') labels.push(t.search.legalStatusFitanolorana);
  if (request.legalStatus === 'other') labels.push(t.search.other);
  if (request.isResidentialArea) labels.push(t.search.isResidentialArea);
  if (request.hasWaterAvailable) labels.push(t.search.hasWaterAvailable);
  if (request.hasElectricityAvailable) labels.push(t.search.hasElectricityAvailable);
  if (request.isBuildReady) labels.push(t.search.isBuildReady);
  return labels;
}
