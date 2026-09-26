'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useTranslation } from '@/lib/i18n/use-translation';

/** Photo d'un message : miniature carrée cliquable, aperçu plein écran au clic. */
export function MessageImage({ src, size = 220 }: { src: string; size?: number }) {
  const { t } = useTranslation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        aria-label={t.messages.viewPhotoAlt}
        className="block rounded-2xl overflow-hidden cursor-zoom-in"
      >
        <Image src={src} alt="" width={size} height={size} className="rounded-2xl object-cover" style={{ width: size, height: size }} />
      </button>
      {isPreviewOpen && (
        <ImageLightbox src={src} onClose={() => setIsPreviewOpen(false)} closeLabel={t.messages.closePhotoPreview} />
      )}
    </>
  );
}
