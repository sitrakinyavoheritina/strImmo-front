/** Formatage partagé d'un prix réel (nombre, en Ariary) — même règle partout où un prix
 * d'annonce réelle s'affiche (fil, fiche détail, résultats de recherche). */
export function formatPrice(price: number): string {
  return `${Math.round(price).toLocaleString('fr-FR')} Ar`;
}
