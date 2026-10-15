'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { AdminPropertyRequestRow, RequestViewBoostConfig } from '../types/property-request.types';
import { useResetRequestViewBoost, useUpdateRequestViewBoost } from '../hooks/use-property-requests';
import { Button } from '@/components/ui/button';

// Adaptation DIRECTE de features/listings/components/view-boost-section.tsx (annonces) — mêmes
// valeurs par défaut (voir la migration backend) utilisées seulement quand `request.viewBoost` est
// absent (jamais configuré pour cette demande). Pas de champs `like*` ici : une demande n'a pas de
// boost des "j'aime", contrairement à une annonce — voir le commentaire de RequestViewBoostConfig.
const DEFAULT_FORM = {
  enabled: false,
  dayStart: '04:00',
  dayEnd: '21:00',
  nightStart: '21:00',
  nightEnd: '04:00',
  dayTarget: 0,
  nightTarget: 0,
};

type FormState = typeof DEFAULT_FORM;

function toFormState(config?: RequestViewBoostConfig): FormState {
  if (!config) return DEFAULT_FORM;
  return {
    enabled: config.enabled,
    dayStart: config.dayStart,
    dayEnd: config.dayEnd,
    nightStart: config.nightStart,
    nightEnd: config.nightEnd,
    dayTarget: config.dayTarget,
    nightTarget: config.nightTarget,
  };
}

const inputClass =
  'w-full rounded-lg border border-stroke-default bg-surface-card px-2.5 py-1.5 text-sm text-content-main outline-none focus:border-brand-primary';

// Miroir de MAX_BOOST_TARGET_PER_PERIOD côté backend — au-delà, l'écart avec l'absence de vraies
// vues d'une demande deviendrait trop visible. Le serveur revalide de toute façon ; ce plafond ici
// n'est qu'un confort d'UI, jamais la seule protection.
const MAX_TARGET_PER_PERIOD = 500;

// Admin/superadmin uniquement (toute la page app/admin/demandes/page.tsx est admin-only) — monté
// repliable sous chaque carte active (voir cette page), jamais pour une demande supprimée.
// Un seul `enabled` pilote la seule métrique disponible ici (les vues) — pas de 2e toggle.
export function AdminRequestViewBoost({ request }: { request: AdminPropertyRequestRow }) {
  const { t } = useTranslation();
  const s = t.requestViewBoostSection;
  const { mutate: updateViewBoost, isPending } = useUpdateRequestViewBoost();
  const { mutate: resetViewBoost, isPending: isResetting } = useResetRequestViewBoost();
  const [form, setForm] = useState<FormState>(() => toFormState(request.viewBoost));
  const [error, setError] = useState(false);
  // Confirmation à deux clics avant réinitialisation — évite un clic malheureux qui remettrait
  // brutalement le compteur à 0 (même mécanique que le modèle annonces, mais une seule métrique
  // ici donc pas besoin de distinguer 'views'/'likes').
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSave() {
    setError(false);
    updateViewBoost(
      { id: request.id, payload: form },
      { onError: () => setError(true) },
    );
  }

  function handleReset() {
    resetViewBoost(request.id);
    setConfirmReset(false);
  }

  const boost = request.viewBoost;

  return (
    <div className="mt-3 bg-surface-app border border-stroke-default rounded-xl p-3 space-y-3">
      <p className="text-sm font-semibold text-content-main">{s.title}</p>

      <div className="flex flex-wrap items-center gap-3 text-[0.85rem] text-content-muted">
        <span>{s.views} : <strong className="text-content-main">{request.viewCount}</strong></span>
        {confirmReset ? (
          <span className="flex items-center gap-1.5">
            {s.resetConfirm}
            <button type="button" onClick={handleReset} disabled={isResetting} className="font-semibold text-danger">
              {s.resetConfirmYes}
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="font-semibold text-content-muted">
              {s.resetCancel}
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="underline hover:text-danger">
            {s.resetLabel}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-[0.85rem] text-content-muted">
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

      {/* Toujours empilé (jamais `sm:grid-cols-2`) : ce panneau se déplie sous une carte de liste
          étroite (voir app/admin/demandes/page.tsx, max-w-2xl), pas sur toute la largeur de
          l'écran — même leçon que view-boost-section.tsx (annonces), constatée en prod là-bas. */}
      <div className="space-y-3">
        {(
          [
            {
              title: s.dayTitle,
              startKey: 'dayStart',
              endKey: 'dayEnd',
              targetKey: 'dayTarget',
              added: boost?.dayAdded,
              effectiveTarget: boost?.dayEffectiveTarget,
            },
            {
              title: s.nightTitle,
              startKey: 'nightStart',
              endKey: 'nightEnd',
              targetKey: 'nightTarget',
              added: boost?.nightAdded,
              effectiveTarget: boost?.nightEffectiveTarget,
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
            <div>
              <label className="block text-[0.75rem] text-content-muted mb-0.5">{s.targetLabel}</label>
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
