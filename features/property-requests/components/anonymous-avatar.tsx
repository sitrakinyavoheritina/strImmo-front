import { Home } from 'lucide-react';

/** Avatar générique (icône logo, pas de photo) pour une demande publique — l'auteur reste
 *  anonyme sur le tableau public (voir property-requests.service.ts:listPublic, qui ne renvoie
 *  jamais son nom ni sa photo), donc jamais d'initiales/photo réelles ici comme sur une carte
 *  d'annonce classique (Avatar). */
export function AnonymousAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary"
      style={{ width: size, height: size }}
    >
      <Home size={Math.round(size * 0.55)} />
    </span>
  );
}
