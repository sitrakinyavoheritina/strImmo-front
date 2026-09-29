/** Valide un paramètre `?next=` avant de s'en servir comme destination de redirection après
 *  connexion — jamais une URL externe/absolue (`https://autre-site...` ou `//autre-site...`,
 *  qu'un lien construit à la main pourrait glisser dans le paramètre), qui ouvrirait une
 *  redirection ouverte (phishing : "connecte-toi sur onina.mg" qui renvoie ensuite ailleurs).
 *  Un chemin relatif commençant par un seul `/` reste forcément sur ce même site. */
export function getSafeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}
