import type { Property, PropertyFormValues } from '../types/listing.types';

/** Formatage partagé d'un prix réel (nombre, en Ariary) — même règle partout où un prix
 * d'annonce réelle s'affiche (fil, fiche détail, résultats de recherche). */
export function formatPrice(price: number): string {
  return `${Math.round(price).toLocaleString('fr-FR')} Ar`;
}

/** Suffixe à ajouter après `formatPrice(property.price)` — seulement pour un terrain dont le prix
 * est au m² (`priceType`, voir land-details.entity.ts), jamais pour un terrain à prix total ni
 * pour les autres types de bien. Centralisé ici plutôt que répété à chaque carte/fiche détail. */
export function getPriceSuffix(property: Property | PropertyFormValues): string {
  return property.propertyType === 'land' && property.priceType === 'per_m2' ? ' / m²' : '';
}
