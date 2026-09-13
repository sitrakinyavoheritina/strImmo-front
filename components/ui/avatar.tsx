import Image from 'next/image';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

const PALETTE = ['#2563eb', '#f97316', '#0891b2', '#7c3aed', '#16a34a', '#db2777'];

function colorFor(name: string): string {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/**
 * Cercle avatar : image si `imageUrl` est fourni, sinon initiales sur un
 * fond de couleur dérivé du nom — pas besoin de sourcer des images d'avatar
 * pour chaque compte mock.
 */
export function Avatar({ name, imageUrl, size = 36, className = '' }: AvatarProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        // `style` (pas juste les props width/height) : le reset Tailwind `img { height: auto }`
        // a une spécificité CSS plus forte que les attributs HTML width/height posés par
        // next/image, donc sans ce style explicite l'avatar s'aplatissait (largeur figée par
        // `max-width`, hauteur recalculée sur le ratio réel de la photo) au lieu de rester un
        // cercle parfait — repéré sur l'icône de profil de la topbar mobile.
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      className={`rounded-full shrink-0 flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: size, height: size, backgroundColor: colorFor(name), fontSize: size * 0.4 }}
    >
      {initialsFor(name)}
    </span>
  );
}
