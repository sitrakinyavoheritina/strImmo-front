'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Bookmark, Flag, Phone, MessageCircle, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useFavoriteIds, useToggleFavorite } from '@/features/search/hooks/use-favorites';
import { useReportProperty } from '@/features/search/hooks/use-report-property';
import type { ReportReason } from '@/features/search/services/property-api';
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
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: favoriteIds } = useFavoriteIds();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const [isOpen, setIsOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isChoosingReason, setIsChoosingReason] = useState(false);
  const { mutate: reportProperty, isPending: isReporting } = useReportProperty();
  const isSaved = favoriteIds?.includes(property.id) ?? false;

  // "Enregistrer" est maintenant un vrai favori côté serveur (voir use-favorites.ts) — comme pour
  // "j'aime", impossible sans compte de savoir à qui l'attribuer.
  function handleSaveClick() {
    setIsOpen(false);
    if (!isAuthenticated) {
      router.push('/connexion');
      return;
    }
    toggleFavorite({ propertyId: property.id, wasSaved: isSaved });
  }

  // Même route que le bouton message autonome de la carte (voir feed-property-card.tsx /
  // feed-property-row.tsx) : la discussion propre à CETTE annonce, pas la liste générale des
  // conversations — un lien statique vers "/messages" ouvrait la messagerie sans jamais atterrir
  // sur le bon fil, constaté explicitement par l'utilisateur.
  function handleChatClick() {
    setIsOpen(false);
    router.push(isAuthenticated ? `/annonce/${property.id}?chat=1` : '/connexion');
  }

  // Signaler : compte requis (un signalement est rattaché à son auteur), puis choix d'un motif —
  // enregistré côté serveur et visible des admins (/admin/signalements).
  function handleReportClick() {
    if (!isAuthenticated) {
      setIsOpen(false);
      router.push('/connexion');
      return;
    }
    setIsChoosingReason(true);
  }

  function handleReason(reason: ReportReason) {
    reportProperty(
      { id: property.id, reason },
      {
        onSuccess: () => {
          setIsReported(true);
          setIsChoosingReason(false);
        },
      },
    );
  }

  const REASONS: { value: ReportReason; label: string }[] = [
    { value: 'spam', label: t.feed.reportReasonSpam },
    { value: 'false_info', label: t.feed.reportReasonFalseInfo },
    { value: 'unavailable', label: t.feed.reportReasonUnavailable },
    { value: 'scam', label: t.feed.reportReasonScam },
    { value: 'other', label: t.feed.reportReasonOther },
  ];

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
              onClick={handleSaveClick}
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

            <button
              type="button"
              onClick={handleChatClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-content-main hover:bg-surface-app transition"
            >
              <MessageCircle size={15} />
              {t.feed.menuChat}
            </button>

            <div className="my-1 border-t border-stroke-default" />

            {isChoosingReason && !isReported ? (
              <div>
                <p className="px-3 py-1.5 text-[12px] font-semibold text-content-muted">{t.feed.reportWhy}</p>
                {REASONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isReporting}
                    onClick={() => handleReason(value)}
                    className="w-full text-left px-3 py-2 text-sm text-content-main hover:bg-surface-app transition disabled:opacity-60"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                disabled={isReported}
                onClick={handleReportClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition disabled:opacity-60 disabled:cursor-default"
              >
                {isReported ? <Check size={15} /> : <Flag size={15} />}
                {isReported ? t.feed.menuReported : t.feed.menuReport}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
