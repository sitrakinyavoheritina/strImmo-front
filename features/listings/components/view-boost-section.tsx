'use client';

import { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { Property, ViewBoostConfig } from '@/features/search/types/listing.types';
import { useUpdateViewBoost } from '@/features/search/hooks/use-update-view-boost';
import { Button } from '@/components/ui/button';

// Valeurs par défaut cohérentes avec celles de la migration backend (voir
// strImmo/sql/2026-10-07-property-view-boost.sql / 2026-10-07-property-like-boost.sql) — utilisées
// seulement quand `property.viewBoost` est absent (aucun boost jamais configuré pour cette annonce).
const DEFAULT_FORM = {
  enabled: false,
  dayStart: '04:00',
  dayEnd: '21:00',
  nightStart: '21:00',
  nightEnd: '04:00',
  dayTarget: 0,
  nightTarget: 0,
  likeDayTarget: 0,
  likeNightTarget: 0,
};

type FormState = typeof DEFAULT_FORM;

function toFormState(config?: ViewBoostConfig): FormState {
  if (!config) return DEFAULT_FORM;
  return {
    enabled: config.enabled,
    dayStart: config.dayStart,
    dayEnd: config.dayEnd,
    nightStart: config.nightStart,
    nightEnd: config.nightEnd,
    dayTarget: config.dayTarget,
    nightTarget: config.nightTarget,
    likeDayTarget: config.likeDayTarget,
    likeNightTarget: config.likeNightTarget,
  };
}

const inputClass =
  'w-full rounded-lg border border-stroke-default bg-surface-card px-2.5 py-1.5 text-sm text-content-main outline-none focus:border-brand-primary';

// Miroir de MAX_BOOST_TARGET_PER_PERIOD côté backend (update-view-boost.dto.ts) — au-delà,
// l'écart avec l'engagement réel d'une annonce deviendrait visible. Le serveur revalide de toute
// façon (@Max côté DTO) ; ce plafond ici n'est qu'un confort d'UI, jamais la seule protection.
const MAX_TARGET_PER_PERIOD = 500;

// Admin/superadmin uniquement (voir annonce-client.tsx, gated par `isAdminUser`) — jamais rendu
// pour un autre visiteur, qui ne reçoit d'ailleurs jamais `property.viewBoost` du backend (voir
// PropertiesService.toPublicView). Un seul `enabled` pilote les deux métriques (vues ET j'aime) —
// un objectif à 0 pour l'une d'elles désactive juste son propre boost, pas besoin d'un 2e toggle.
export function ViewBoostSection({ property, t }: { property: Property; t: Translations }) {
  const s = t.viewBoostSection;
  const { mutate: updateViewBoost, isPending } = useUpdateViewBoost();
  const [form, setForm] = useState<FormState>(() => toFormState(property.viewBoost));
  const [error, setError] = useState(false);

  function handleSave() {
    setError(false);
    updateViewBoost(
      { id: property.id, payload: form },
      { onError: () => setError(true) },
    );
  }

  const totalViews = property.viewCount + property.boostViews;
  const totalLikes = property.likesCount + property.boostLikes;
  const boost = property.viewBoost;

  return (
    <div className="mt-3 bg-surface-app border border-stroke-default rounded-xl p-3 space-y-3">
      <p className="text-sm font-semibold text-content-main">{s.title}</p>

      <div className="flex flex-wrap gap-3 text-[0.85rem] text-content-muted">
        <span>{s.realViews} : <strong className="text-content-main">{property.viewCount}</strong></span>
        <span>{s.boostedViews} : <strong className="text-content-main">{property.boostViews}</strong></span>
        <span>{s.totalViews} : <strong className="text-content-main">{totalViews}</strong></span>
      </div>
      <div className="flex flex-wrap gap-3 text-[0.85rem] text-content-muted">
        <span>{s.realLikes} : <strong className="text-content-main">{property.likesCount}</strong></span>
        <span>{s.boostedLikes} : <strong className="text-content-main">{property.boostLikes}</strong></span>
        <span>{s.totalLikes} : <strong className="text-content-main">{totalLikes}</strong></span>
        <span>
          {s.nextBoost} :{' '}
          <strong className="text-content-main">
            {boost?.nextBoostAt ? new Date(boost.nextBoostAt).toLocaleString() : s.never}
          </strong>
        </span>
      </div>

      <label className="flex items-center gap-2 text-sm text-content-main">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(event) => setForm({ ...form, enabled: event.target.checked })}
        />
        {s.enabledLabel}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(
          [
            {
              title: s.dayTitle,
              startKey: 'dayStart',
              endKey: 'dayEnd',
              targetKey: 'dayTarget',
              added: boost?.dayAdded,
              effectiveTarget: boost?.dayEffectiveTarget,
              likeTargetKey: 'likeDayTarget',
              likeAdded: boost?.likeDayAdded,
              likeEffectiveTarget: boost?.likeDayEffectiveTarget,
            },
            {
              title: s.nightTitle,
              startKey: 'nightStart',
              endKey: 'nightEnd',
              targetKey: 'nightTarget',
              added: boost?.nightAdded,
              effectiveTarget: boost?.nightEffectiveTarget,
              likeTargetKey: 'likeNightTarget',
              likeAdded: boost?.likeNightAdded,
              likeEffectiveTarget: boost?.likeNightEffectiveTarget,
            },
          ] as const
        ).map((period) => (
          <div key={period.title} className="rounded-lg border border-stroke-default p-2.5 space-y-2">
            <p className="text-[0.85rem] font-semibold text-content-main">{period.title}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.75rem] text-content-muted mb-0.5">{s.startLabel}</label>
                <input
                  type="time"
                  value={form[period.startKey]}
                  onChange={(event) => setForm({ ...form, [period.startKey]: event.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[0.75rem] text-content-muted mb-0.5">{s.endLabel}</label>
                <input
                  type="time"
                  value={form[period.endKey]}
                  onChange={(event) => setForm({ ...form, [period.endKey]: event.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.75rem] text-content-muted mb-0.5">
                  {s.targetLabel} ({s.viewsShort})
                </label>
                <input
                  type="number"
                  min={0}
                  max={MAX_TARGET_PER_PERIOD}
                  value={form[period.targetKey]}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      [period.targetKey]: Math.min(
                        MAX_TARGET_PER_PERIOD,
                        Math.max(0, Number(event.target.value) || 0),
                      ),
                    })
                  }
                  className={inputClass}
                />
                {period.added != null && (
                  <p className="text-[0.75rem] text-content-muted mt-0.5">
                    {s.addedLabel} : {period.added}/{period.effectiveTarget}{' '}
                    <span className="opacity-70">({s.configuredCeiling} {form[period.targetKey]})</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[0.75rem] text-content-muted mb-0.5">
                  {s.targetLabel} ({s.likesShort})
                </label>
                <input
                  type="number"
                  min={0}
                  max={MAX_TARGET_PER_PERIOD}
                  value={form[period.likeTargetKey]}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      [period.likeTargetKey]: Math.min(
                        MAX_TARGET_PER_PERIOD,
                        Math.max(0, Number(event.target.value) || 0),
                      ),
                    })
                  }
                  className={inputClass}
                />
                {period.likeAdded != null && (
                  <p className="text-[0.75rem] text-content-muted mt-0.5">
                    {s.addedLabel} : {period.likeAdded}/{period.likeEffectiveTarget}{' '}
                    <span className="opacity-70">({s.configuredCeiling} {form[period.likeTargetKey]})</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
        {isPending ? s.saving : s.save}
      </Button>
      {error && <p className="text-[0.85rem] text-danger mt-1.5">{s.saveError}</p>}
    </div>
  );
}
