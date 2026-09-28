'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Flag, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useReportPropertyRequest } from '../hooks/use-property-requests';
import type { PropertyRequestReportReason } from '../types/property-request.types';

/** Menu "..." d'une carte de demande (tableau public) : uniquement "Signaler" pour l'instant — pas
 *  d'"Enregistrer" (pas de favoris sur une demande) ni de contact direct (déjà un bouton dédié à
 *  côté). Même mécanique que CardOptionsMenu (signalement d'annonce) : compte requis, choix d'un
 *  motif, idempotent côté serveur. */
export function PropertyRequestOptionsMenu({ requestId }: { requestId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [isChoosingReason, setIsChoosingReason] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const { mutate: reportRequest, isPending } = useReportPropertyRequest();

  function handleReportClick() {
    if (!isAuthenticated) {
      setIsOpen(false);
      router.push('/connexion');
      return;
    }
    setIsChoosingReason(true);
  }

  function handleReason(reason: PropertyRequestReportReason) {
    reportRequest(
      { id: requestId, reason },
      { onSuccess: () => { setIsReported(true); setIsChoosingReason(false); } }
    );
  }

  const REASONS: { value: PropertyRequestReportReason; label: string }[] = [
    { value: 'spam', label: t.propertyRequestsPage.reportReasonSpam },
    { value: 'inappropriate', label: t.propertyRequestsPage.reportReasonInappropriate },
    { value: 'scam', label: t.propertyRequestsPage.reportReasonScam },
    { value: 'other', label: t.propertyRequestsPage.reportReasonOther },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Options"
        aria-expanded={isOpen}
        className="text-content-muted hover:text-content-main transition shrink-0"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <>
          <button type="button" aria-label="Fermer" onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-surface-card border border-stroke-default rounded-xl shadow-lg py-1">
            {isChoosingReason && !isReported ? (
              <div>
                <p className="px-3 py-1.5 text-[12px] font-semibold text-content-muted">{t.propertyRequestsPage.reportWhy}</p>
                {REASONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isPending}
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
                {isReported ? <Check size={20} /> : <Flag size={20} />}
                {isReported ? t.propertyRequestsPage.menuReported : t.propertyRequestsPage.menuReport}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
