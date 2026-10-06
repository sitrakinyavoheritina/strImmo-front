'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type ImageLightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
  closeLabel: string;
  // Navigation optionnelle entre plusieurs photos (fiche détail d'une annonce) — absente, le
  // composant se comporte exactement comme avant (une seule image, ex. pièce jointe de message) :
  // pas de flèches, pas de swipe. `photos`/`index` doivent être fournis ensemble.
  photos?: string[];
  index?: number;
  onNavigate?: (index: number) => void;
  previousLabel?: string;
  nextLabel?: string;
};

// Distance minimale (px) pour compter comme un glissement plutôt qu'un simple tap — en-dessous,
// le clic de fermeture habituel s'applique toujours.
const SWIPE_THRESHOLD = 40;

/** Aperçu plein écran d'une image (photo pièce jointe d'un message, photo d'annonce...) —
 * fermeture au clic sur le fond, sur la croix, ou avec Échap. Avec `photos`/`index`/`onNavigate`
 * fournis (plusieurs photos) : flèches gauche/droite, flèches du clavier, et glissement tactile
 * (swipe) pour naviguer sans refermer. Pas de zoom/pan : juste voir l'image en grand à sa
 * résolution native. */
export function ImageLightbox({
  src,
  alt = '',
  onClose,
  closeLabel,
  photos,
  index = 0,
  onNavigate,
  previousLabel,
  nextLabel,
}: ImageLightboxProps) {
  const hasNav = !!photos && photos.length > 1 && !!onNavigate;
  const canPrev = hasNav && index > 0;
  const canNext = hasNav && index < photos.length - 1;
  // Un swipe qui vient de naviguer ne doit pas aussi déclencher le clic de fermeture du fond —
  // `touchend` et le `click` synthétisé juste après visent le même élément.
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft' && canPrev) onNavigate!(index - 1);
      else if (event.key === 'ArrowRight' && canNext) onNavigate!(index + 1);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, canPrev, canNext, index]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
    didSwipe.current = false;
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (touchStartX.current == null) return;
    if (Math.abs(event.touches[0].clientX - touchStartX.current) > 10) didSwipe.current = true;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current == null || !hasNav) return;
    const dx = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0 && canNext) onNavigate!(index + 1);
    else if (dx > 0 && canPrev) onNavigate!(index - 1);
  }

  function handleBackdropClick() {
    // Le `click` synthétisé après un swipe tactile ne doit pas refermer l'aperçu.
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    onClose();
  }

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label={closeLabel}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out touch-pan-y"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
      >
        <X size={20} />
      </button>
      {canPrev && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate!(index - 1);
          }}
          aria-label={previousLabel}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate!(index + 1);
          }}
          aria-label={nextLabel}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
        >
          <ChevronRight size={22} />
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- plein écran à taille native, pas d'optimisation Next Image utile ici */}
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg cursor-default"
      />
    </div>
  );
}
