import { Shield, Percent, DoorOpen, type LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { formatPrice } from '@/features/search/utils/format-price';

type FeeValues = {
  commissionPercent?: number | null;
  cautionPercent?: number | null;
  visitFee?: number | null;
  kind?: 'sale' | 'rent';
};

/** Caution / commission / droit de visite, sous forme de petites cartes iconifiées plutôt que de
 * texte brut séparé par des virgules — partagé entre l'aperçu avant publication
 * (listing-preview.tsx) et la fiche détail publiée (app/annonce/[id]/page.tsx) pour qu'ils
 * affichent exactement le même rendu. Caution/commission affichées en % tel que choisi dans le
 * formulaire (voir property-form.tsx FEE_PERCENT_OPTIONS) — jamais un montant Ariary recalculé ;
 * droit de visite, lui, reste un vrai montant. */
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
  const items: { key: string; icon: LucideIcon; label: string; value: string }[] = [];
  // Une caution n'a de sens que pour une location — jamais affichée pour un bien à vendre, même
  // si une valeur est encore présente en base (ancienne annonce, champ pas toujours nettoyé au
  // changement de type de transaction).
  if (values.cautionPercent != null && values.kind !== 'sale') {
    items.push({ key: 'caution', icon: Shield, label: t.listing.caution, value: `${values.cautionPercent} %` });
  }
  const isOwner = publisherType === 'owner';
  if (values.commissionPercent != null && !isOwner) {
    items.push({ key: 'commission', icon: Percent, label: t.listing.commission, value: `${values.commissionPercent} %` });
  }
  if (values.visitFee != null && !isOwner) {
    items.push({ key: 'visitFee', icon: DoorOpen, label: t.propertyDetail.visitFee, value: formatPrice(values.visitFee) });
  }
  if (items.length === 0) return null;

  return (
    // Côte à côte, en rangée qui passe à la ligne si besoin — sur mobile comme sur grand écran
    // (remonté explicitement après un premier essai en colonne empilée sur ordinateur).
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-1.5 rounded-lg border border-stroke-default bg-surface-app px-2.5 py-1.5"
        >
          <item.icon size={14} className="text-brand-primary shrink-0" />
          <div className="leading-tight">
            <p className="text-[12px] text-content-muted">{item.label}</p>
            <p className="text-[12px] font-bold text-content-main">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
