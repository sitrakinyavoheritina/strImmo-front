'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Bookmark, Flag, Phone, MessageCircle, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';
import type { Property } from '@/features/search/types/listing.types';

/** Menu "..." : enregistrer, contacter le vendeur, discuter, signaler — utilisé sur la carte du
 *  fil et sur la fiche détail (voir `triggerClassName`, qui permet d'adapter le bouton
 *  déclencheur à chaque contexte : discret dans la carte, cercle blanc en overlay sur la photo
 *  de la fiche détail). */
export function CardOptionsMenu({
  property,
  triggerClassName = 'text-content-muted hover:text-content-main transition shrink-0',
}: {
  property: Property;
  triggerClassName?: string;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const isSaved = useFavoritesStore((state) => state.favorites.includes(property.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Options"
        aria-expanded={isOpen}
        className={triggerClassName}
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <>
          {/* Ferme le menu au clic en dehors, sans backdrop visible — même pattern que LanguageMenu. */}
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-surface-card border border-stroke-default rounded-xl shadow-lg py-1">
            <button
              type="button"
              onClick={() => {
                toggleFavorite(property.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-content-main hover:bg-surface-app transition"
            >
              <Bookmark size={15} className={isSaved ? 'fill-brand-primary text-brand-primary' : ''} />
              {isSaved ? t.feed.menuSaved : t.feed.menuSave}
            </button>

            {property.contactPhone && (
              <a
                href={`tel:${property.contactPhone}`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-content-main hover:bg-surface-app transition"
              >
                <Phone size={15} />
                {t.feed.menuContact}
              </a>
            )}

            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-content-main hover:bg-surface-app transition"
            >
              <MessageCircle size={15} />
              {t.feed.menuChat}
            </Link>

            <div className="my-1 border-t border-stroke-default" />

            <button
              type="button"
              disabled={isReported}
              onClick={() => setIsReported(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition disabled:opacity-60 disabled:cursor-default"
            >
              {isReported ? <Check size={15} /> : <Flag size={15} />}
              {isReported ? t.feed.menuReported : t.feed.menuReport}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
