'use client';

import { Eye, Heart, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { usePropertyStatistics } from '../hooks/use-analytics-queries';

const fmt = (n: number) => n.toLocaleString('fr-FR');

/** "Statistiques de mon annonce" — visible du seul propriétaire sur la fiche de son annonce (le
 * backend refuse toute autre demande, voir PropertyViewsService.getStatistics). */
export function OwnerPropertyStats({ propertyId }: { propertyId: string }) {
  const { t } = useTranslation();
  const { data } = usePropertyStatistics(propertyId, true);
  if (!data) return null;

  const tiles = [
    { icon: Eye, label: t.propertyStats.views, value: data.views.total },
    { icon: Heart, label: t.propertyStats.favorites, value: data.favorites },
    { icon: MessageCircle, label: t.propertyStats.messages, value: data.messages },
    { icon: Phone, label: t.propertyStats.contacts, value: data.contacts },
  ];

  return (
    <div className="mt-3 bg-surface-card border border-stroke-default/80 rounded-xl p-3">
      <h3 className="text-sm font-bold text-content-main mb-2">{t.propertyStats.title}</h3>
      <div className="grid grid-cols-4 gap-2">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <Icon size={16} className="mx-auto text-brand-primary" />
            <div className="text-base font-bold text-content-main mt-0.5">{fmt(value)}</div>
            <div className="text-[12px] text-content-muted">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-content-muted mt-2">
        {fmt(data.views.today)} {t.propertyStats.today} · {fmt(data.views.week)} {t.propertyStats.week} ·{' '}
        {fmt(data.views.month)} {t.propertyStats.month} · {fmt(data.views.uniqueVisitors)}{' '}
        {t.propertyStats.unique}
      </p>
    </div>
  );
}
