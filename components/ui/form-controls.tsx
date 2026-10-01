/**
 * Petits contrôles de formulaire partagés entre le modal de filtres
 * (`features/search/components/filter-modal.tsx`) et le formulaire de création d'annonce
 * (`features/listings/`) — mêmes champs, même style, extraits ici pour ne pas dupliquer.
 */

export function Chip({
  active,
  onClick,
  children,
  // `'lg'` : légèrement plus grand que les autres puces d'un même groupe (ex. "Intermédiaire
  // (Panera)" face à "Propriétaire"/"Agence", demandé explicitement) — jamais le défaut, pour ne
  // rien changer aux innombrables autres usages de `Chip` qui ne passent pas ce prop.
  size = 'default',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: 'default' | 'lg';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full font-semibold border transition ${
        size === 'lg' ? 'px-4 py-2 text-[0.95rem]' : 'px-3 py-1.5 text-[0.85rem]'
      } ${
        active
          ? 'bg-brand-primary text-white border-brand-primary'
          : 'bg-surface-app text-content-muted border-stroke-default hover:border-brand-primary'
      }`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-stroke-default text-sm text-content-main hover:border-brand-primary/60 transition"
    >
      {label}
      <span
        className={`w-9 h-5 rounded-full transition relative shrink-0 ${checked ? 'bg-brand-primary' : 'bg-stroke-default'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${checked ? 'left-4' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[0.85rem] font-semibold text-content-muted mb-1.5 block">{children}</label>;
}

/** Regroupe visuellement un ensemble de champs, séparé du précédent par un filet. */
export function Section({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 py-4 border-b border-stroke-default last:border-b-0">{children}</div>;
}

type FormInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  suffix?: string;
  error?: string;
  /** Grisé et non éditable — ex. la caution pour un bien à vendre (n'a pas de sens hors location). */
  disabled?: boolean;
  hint?: string;
};

export function FormInput({ label, value, onChange, placeholder, type = 'text', suffix, error, disabled, hint }: FormInputProps) {
  // `type="text"` + `inputMode="numeric"` plutôt que `type="number"` : les flèches natives d'un
  // champ number se superposaient au suffixe ("Ar", "m²") positionné en absolu à droite — ce
  // combo garde le clavier numérique sur mobile sans ces flèches ni ce chevauchement.
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="text"
          inputMode={type === 'number' ? 'numeric' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm placeholder-content-muted focus:outline-none transition ${
            suffix ? 'pr-10' : ''
          } ${error ? 'border-danger' : 'border-stroke-default'} ${
            disabled
              ? 'bg-stroke-default/30 text-content-muted cursor-not-allowed'
              : 'bg-surface-app text-content-main focus:bg-surface-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-content-muted">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-[0.85rem] text-danger">{error}</p>}
      {hint && !error && <p className="mt-1 text-[0.85rem] text-content-muted">{hint}</p>}
    </div>
  );
}
