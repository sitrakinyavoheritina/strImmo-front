'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FieldLabel } from './form-controls';

export type SearchableSelectOption = { id: string; label: string; sublabel?: string };

// Même règle que la recherche de l'accueil (use-debounced-search-filters.ts) : la saisie ne
// filtre qu'à partir de 4 lettres, pas dès la première — sous ce seuil, la liste par défaut
// (non filtrée) reste affichée. `MAX_RESULTS` : ~1500 communes (ou une commune à beaucoup de
// fokontany) rendues d'un coup sans ça, demandé explicitement.
const MIN_QUERY_LENGTH = 4;
const MAX_RESULTS = 15;

type SearchableSelectProps = {
  label: string;
  value: string | undefined;
  onChange: (id: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  error?: string;
};

// Liste déroulante filtrable par saisie — un simple `<select>` natif devient inutilisable au-delà
// de quelques dizaines d'options (ex. ~1500 communes, ou une commune à beaucoup de fokontany),
// demandé implicitement par le volume de données du référentiel Commune/Fokontany (voir
// property-form.tsx). Même style que FormInput/FieldLabel (form-controls.tsx) pour rester
// cohérent avec le reste du formulaire — pas un composant de recherche générique séparé.
export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.id === value);
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const matches =
      trimmed.length < MIN_QUERY_LENGTH
        ? options
        : options.filter((option) => option.label.toLowerCase().includes(trimmed));
    return matches.slice(0, MAX_RESULTS);
  }, [options, query]);

  function handleSelect(option: SearchableSelectOption) {
    onChange(option.id);
    setQuery('');
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-left focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-danger' : 'border-stroke-default'
        }`}
      >
        <span className={`truncate ${selected ? 'text-content-main' : 'text-content-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-content-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface-card border border-stroke-default rounded-xl shadow-lg overflow-hidden">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2.5 border-b border-stroke-default text-sm text-content-main placeholder-content-muted outline-none"
            />
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-sm text-content-muted">{emptyMessage}</p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-app transition ${
                      option.id === value ? 'bg-brand-primary-soft text-brand-primary font-semibold' : 'text-content-main'
                    }`}
                  >
                    {option.label}
                    {option.sublabel && <span className="text-content-muted"> · {option.sublabel}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
