import { Shield, Percent, DoorOpen, type LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { formatPrice } from '@/features/search/utils/format-price';

type FeeValues = { commission?: number | null; caution?: number | null; visitFee?: number | null };

/** Caution / commission / droit de visite, sous forme de petites cartes iconifiées plutôt que de
 * texte brut séparé par des virgules — partagé entre l'aperçu avant publication
 * (listing-preview.tsx) et la fiche détail publiée (app/annonce/[id]/page.tsx) pour qu'ils
 * affichent exactement le même rendu. */
export function PropertyFees({ values, t, className = '' }: { values: FeeValues; t: Translations; className?: string }) {
  const items: { key: string; icon: LucideIcon; label: string; value: number }[] = [];
  if (values.caution != null) items.push({ key: 'caution', icon: Shield, label: t.listing.caution, value: values.caution });
  if (values.commission != null) items.push({ key: 'commission', icon: Percent, label: t.listing.commission, value: values.commission });
  if (values.visitFee != null) items.push({ key: 'visitFee', icon: DoorOpen, label: t.propertyDetail.visitFee, value: values.visitFee });
  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-1.5 rounded-lg border border-stroke-default bg-surface-app px-2.5 py-1.5"
        >
          <item.icon size={14} className="text-brand-primary shrink-0" />
          <div className="leading-tight">
            <p className="text-[12px] text-content-muted">{item.label}</p>
            <p className="text-[12px] font-bold text-content-main">{formatPrice(item.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
