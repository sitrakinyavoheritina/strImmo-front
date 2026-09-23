/**
 * Petits contrôles de formulaire partagés entre le modal de filtres
 * (`features/search/components/filter-modal.tsx`) et le formulaire de création d'annonce
 * (`features/listings/`) — mêmes champs, même style, extraits ici pour ne pas dupliquer.
 */

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[0.85rem] font-semibold border transition ${
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
};

export function FormInput({ label, value, onChange, placeholder, type = 'text', suffix, error }: FormInputProps) {
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
          className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
            suffix ? 'pr-10' : ''
          } ${error ? 'border-danger' : 'border-stroke-default'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-content-muted">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-[0.85rem] text-danger">{error}</p>}
    </div>
  );
}
