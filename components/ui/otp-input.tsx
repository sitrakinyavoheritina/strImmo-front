'use client';

import { useRef } from 'react';

const LENGTH = 6;

/** Saisie d'un code à 6 chiffres en 6 cases : avance toute seule à la case suivante, Retour arrière
 *  revient en arrière, flèches gauche/droite, et le collage d'un code entier (ou l'auto-remplissage
 *  du SMS sur mobile, `autocomplete="one-time-code"`) remplit toutes les cases d'un coup. */
export function OtpInput({
  value,
  onChange,
  label,
  autoFocus = false,
  hasError = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoFocus?: boolean;
  hasError?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  function focusAt(index: number) {
    refs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  }

  function setDigitsFrom(index: number, raw: string) {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;
    const next = value.padEnd(LENGTH, ' ').split('');
    let cursor = index;
    for (const char of typed) {
      if (cursor >= LENGTH) break;
      next[cursor++] = char;
    }
    onChange(next.join('').replace(/ /g, '').slice(0, LENGTH));
    focusAt(cursor);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) {
        onChange(digits.map((d, i) => (i === index ? '' : d)).join(''));
      } else if (index > 0) {
        onChange(digits.map((d, i) => (i === index - 1 ? '' : d)).join(''));
        focusAt(index - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  return (
    <div role="group" aria-label={label}>
      <p className="mb-1.5 text-[0.85rem] font-semibold text-content-muted">{label}</p>
      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            autoFocus={autoFocus && index === 0}
            maxLength={LENGTH}
            value={digit}
            aria-label={`${label} ${index + 1}`}
            onChange={(event) => setDigitsFrom(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            onPaste={(event) => {
              event.preventDefault();
              setDigitsFrom(index, event.clipboardData.getData('text'));
            }}
            className={`w-full min-w-0 aspect-square max-w-12 text-center text-xl font-bold text-content-main bg-surface-app border rounded-xl focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
              hasError ? 'border-danger' : 'border-stroke-default'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
