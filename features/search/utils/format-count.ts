// Port de Onina-mobile — abrège un compteur social (likes, vues...) façon FB/Instagram ("1.2k" au
// lieu de "1200"), jamais une vraie troncature de valeur, juste l'affichage.
export function formatCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);
}
