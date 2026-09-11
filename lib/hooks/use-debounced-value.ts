import { useEffect, useState } from 'react';

// Retarde la propagation d'une valeur qui change vite (saisie clavier) pour éviter de déclencher
// une action coûteuse (ex. requête réseau) à chaque frappe — la valeur ne se met à jour qu'après
// `delayMs` sans nouveau changement. Port direct du hook mobile équivalent.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
