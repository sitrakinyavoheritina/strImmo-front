'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

type ListingPhotoPickerProps = {
  photos: File[];
  onChange: (photos: File[]) => void;
  min: number;
  max: number;
};

// Une photo de smartphone/appareil moderne dépasse facilement 5-10 Mo à pleine résolution —
// inutile pour l'affichage, et proche de la limite serveur. `MAX_ORIGINAL_SIZE` rejette d'emblée
// un fichier vraiment excessif ; les photos acceptées sont redimensionnées/recompressées avant
// d'être ajoutées. Port de Onina-mobile/.../listing-photo-picker.tsx (expo-image-manipulator →
// canvas, seule différence : pas d'équivalent RN à porter côté web).
const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024;
const TARGET_WIDTH = 1600;
const COMPRESS_QUALITY = 0.7;

async function shrinkPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const targetWidth = Math.min(bitmap.width, TARGET_WIDTH);
  const targetHeight = Math.round((bitmap.height / bitmap.width) * targetWidth);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', COMPRESS_QUALITY)
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

/** Grille de photos pour la création d'annonce : entre `min` et `max` photos, la première de la
 * liste est toujours la couverture (badge dédié) — on peut promouvoir une autre photo en
 * couverture, ou en supprimer une. */
export function ListingPhotoPicker({ photos, onChange, min, max }: ListingPhotoPickerProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const remaining = max - photos.length;

  // Pas de révocation via useEffect ici : en Strict Mode (dev), React monte/démonte/remonte les
  // effets une fois par exercice, ce qui révoquait ces URL blob avant que les vignettes n'aient
  // fini de s'afficher (miniatures cassées). Au plus `max` (8) petites photos déjà compressées le
  // temps de ce formulaire — le navigateur les libère de toute façon au déchargement de la page.
  const previewUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, remaining);
    event.target.value = '';
    if (selected.length === 0) return;

    const accepted = selected.filter((file) => file.size <= MAX_ORIGINAL_SIZE);
    if (accepted.length === 0) return;

    setIsProcessing(true);
    try {
      const shrunk = await Promise.all(accepted.map(shrinkPhoto));
      onChange([...photos, ...shrunk].slice(0, max));
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRemove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function handleSetCover(index: number) {
    if (index === 0) return;
    const next = [...photos];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-content-muted">{t.listing.photos}</span>
        <span className={`text-xs font-semibold ${photos.length < min ? 'text-danger' : 'text-content-muted'}`}>
          {photos.length}/{max} {photos.length < min ? `(${t.listing.photosMinHint})` : ''}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {photos.map((_, index) => (
          <div key={previewUrls[index] ?? index} className="relative h-24 w-24 rounded-xl overflow-hidden bg-stroke-default">
            {previewUrls[index] && (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), pas une image distante à optimiser
              <img src={previewUrls[index]} alt="" className="w-full h-full object-cover" />
            )}
            {index === 0 ? (
              <span className="absolute bottom-1 left-1 bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                {t.listing.cover}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSetCover(index)}
                className="absolute bottom-1 left-1 bg-surface-card/90 text-content-main text-[9px] font-semibold px-1.5 py-0.5 rounded"
              >
                {t.listing.setCover}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label={t.listing.removePhoto}
              className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-surface-card/90 text-content-main"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <label
            htmlFor={inputId}
            className="h-24 w-24 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-stroke-default text-content-muted cursor-pointer hover:border-brand-primary transition"
          >
            <Plus size={20} />
            <span className="text-[10px]">{isProcessing ? '…' : t.listing.addPhoto}</span>
          </label>
        )}
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={isProcessing}
        onChange={handleFilesSelected}
      />
    </div>
  );
}
