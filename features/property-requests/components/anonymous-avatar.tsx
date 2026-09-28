import { VenetianMask } from 'lucide-react';

/** Avatar générique (icône masque, pas de photo) pour une demande publique — l'auteur reste
 *  anonyme sur le tableau public (voir property-requests.service.ts:listPublic, qui ne renvoie
 *  jamais son nom ni sa photo), donc jamais d'initiales/photo réelles ici comme sur une carte
 *  d'annonce classique (Avatar). Gris neutre plutôt que la couleur de marque (même registre que le
 *  repli "pas de photo" de topbar.tsx) : un profil masqué ne doit pas ressembler à un vrai profil
 *  ni au logo de l'app, pour que l'anonymat se voie au premier coup d'œil. */
export function AnonymousAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-surface-app border border-stroke-default text-content-muted"
      style={{ width: size, height: size }}
    >
      <VenetianMask size={Math.round(size * 0.55)} />
    </span>
  );
}
