import type { Locale } from '@/lib/i18n/use-translation';
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
