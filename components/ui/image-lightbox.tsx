'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

type ImageLightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
  closeLabel: string;
};

/** Aperçu plein écran d'une image (photo pièce jointe d'un message, etc.) — fermeture au clic sur
 * le fond, sur la croix, ou avec Échap. Pas de zoom/pan : juste voir l'image en grand à sa
 * résolution native, ce qui est le seul besoin actuel (miniature de chat trop petite pour
 * distinguer les détails). */
export function ImageLightbox({ src, alt = '', onClose, closeLabel }: ImageLightboxProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label={closeLabel}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
      >
        <X size={20} />
      </button>
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
