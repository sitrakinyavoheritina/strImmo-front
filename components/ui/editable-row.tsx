'use client';

import { Pencil } from 'lucide-react';

/** Champ en lecture seule tant que son crayon n'a pas été cliqué — comme sur Facebook, plutôt que
 * tous les champs en saisie libre d'emblée. Port de Onina-mobile/src/components/ui/editable-row.tsx.
 * Une fois passé en édition, le reste de la session sur cet écran, il ne revient pas en lecture
 * seule (même comportement que mobile — pas de bouton "annuler" par champ). */
export function EditableRow({
  label,
  value,
  displayValue,
  editing,
  onEdit,
  error,
  editLabel,
  ...inputProps
}: {
  label: string;
  value: string;
  /** Valeur affichée en lecture seule à la place de `value` (ex. "••••••••" pour un mot de passe). */
  displayValue?: string;
  editing: boolean;
  onEdit: () => void;
  error?: string;
  editLabel: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>) {
  return (
    <div className="py-2.5 border-b border-stroke-default last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-content-muted">{label}</span>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            className="text-content-muted hover:text-brand-primary transition p-0.5 -m-0.5"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>
      {editing ? (
        <>
          <input
            {...inputProps}
            value={value}
            autoFocus
            className={`mt-1 w-full py-1 bg-transparent border-b text-sm text-content-main outline-none focus:border-brand-primary transition ${
              error ? 'border-danger' : 'border-stroke-default'
            }`}
          />
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </>
      ) : (
        <p className="mt-0.5 text-sm text-content-main truncate">{displayValue ?? (value || '—')}</p>
      )}
    </div>
  );
}
