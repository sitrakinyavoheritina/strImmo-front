'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { FileInput } from './file-input';

export type NifStatMode = 'manual' | 'photo';

export interface NifStatValue {
  mode: NifStatMode;
  nifNumber: string;
  statNumber: string;
  nif: File | null;
  stat: File | null;
}

export const EMPTY_NIF_STAT: NifStatValue = { mode: 'manual', nifNumber: '', statNumber: '', nif: null, stat: null };

/** Seul le mode choisi part au serveur : basculer de l'un à l'autre ne doit pas laisser partir ce
 * qui avait été saisi/choisi dans l'autre. */
export function toNifStatPayload(value: NifStatValue) {
  return value.mode === 'manual'
    ? { nifNumber: value.nifNumber.trim(), statNumber: value.statNumber.trim() }
    : { nif: value.nif, stat: value.stat };
}

const INPUT_CLASS =
  'w-full px-3 py-2 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition';

/** NIF et STAT d'une agence — facultatifs (archive, jamais affichés sur son profil), au choix
 * saisis à la main ou envoyés en photo. Voir strImmo/src/auth/services/auth-agency.service.ts. */
export function NifStatFields({ value, onChange }: { value: NifStatValue; onChange: (value: NifStatValue) => void }) {
  const { t } = useTranslation();
  const modes: { mode: NifStatMode; label: string }[] = [
    { mode: 'manual', label: t.auth.nifStatManual },
    { mode: 'photo', label: t.auth.nifStatPhoto },
  ];

  return (
    <div className="space-y-2.5 border-t border-stroke-default pt-3 sm:pt-4">
      <div>
        <p className="text-sm font-bold text-content-main">{t.auth.nifStatTitle}</p>
        <p className="text-xs text-content-muted mt-0.5">{t.auth.nifStatHint}</p>
      </div>

      <div className="flex bg-surface-app p-1 rounded-xl">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ ...value, mode })}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              value.mode === mode ? 'bg-surface-card text-content-main shadow-sm' : 'text-content-muted hover:text-content-main'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {value.mode === 'manual' ? (
        <>
          <div>
            <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.nifNumber}</label>
            <input
              type="text"
              value={value.nifNumber}
              onChange={(event) => onChange({ ...value, nifNumber: event.target.value })}
              placeholder={t.auth.nifNumberPlaceholder}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.statNumber}</label>
            <input
              type="text"
              value={value.statNumber}
              onChange={(event) => onChange({ ...value, statNumber: event.target.value })}
              placeholder={t.auth.statNumberPlaceholder}
              className={INPUT_CLASS}
            />
          </div>
        </>
      ) : (
        <>
          <FileInput label={t.auth.nifDocument} file={value.nif} onChange={(nif) => onChange({ ...value, nif })} />
          <FileInput label={t.auth.statDocument} file={value.stat} onChange={(stat) => onChange({ ...value, stat })} />
        </>
      )}
    </div>
  );
}
