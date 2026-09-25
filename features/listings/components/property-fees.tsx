import { Shield, Percent, DoorOpen, type LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { formatPrice } from '@/features/search/utils/format-price';

type FeeValues = { commission?: number | null; caution?: number | null; visitFee?: number | null };

/** Caution / commission / droit de visite, sous forme de petites cartes iconifiées plutôt que de
 * texte brut séparé par des virgules — partagé entre l'aperçu avant publication
 * (listing-preview.tsx) et la fiche détail publiée (app/annonce/[id]/page.tsx) pour qu'ils
 * affichent exactement le même rendu. */
export function PropertyFees({
  values,
  t,
  publisherType,
  className = '',
}: {
  values: FeeValues;
  t: Translations;
  /** Un propriétaire (particulier) n'affiche que la caution — ni commission (réservée aux
   *  intermédiaires/agences) ni droit de visite. */
  publisherType?: string;
  className?: string;
}) {
  const items: { key: string; icon: LucideIcon; label: string; value: number }[] = [];
  if (values.caution != null) items.push({ key: 'caution', icon: Shield, label: t.listing.caution, value: values.caution });
  const isOwner = publisherType === 'owner';
  if (values.commission != null && !isOwner) items.push({ key: 'commission', icon: Percent, label: t.listing.commission, value: values.commission });
  if (values.visitFee != null && !isOwner) items.push({ key: 'visitFee', icon: DoorOpen, label: t.propertyDetail.visitFee, value: values.visitFee });
  if (items.length === 0) return null;

  return (
    // Ordinateur : les frais s'empilent de haut en bas (pas côte à côte) ; mobile : rangée qui passe à la ligne.
    <div className={`flex flex-wrap gap-2 lg:flex-col lg:items-start ${className}`}>
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
