'use client';

import { useState } from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // `useState` plutôt qu'une constante au niveau module : garantit une instance par session
  // client (pas de partage de cache entre requêtes serveur différentes en cas de SSR futur).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Le défaut (retry: 3) réessaie aussi les 401 — sans intérêt tant que le token n'a
            // pas changé (voir l'intercepteur de réponse dans lib/api/client.ts, qui purge la
            // session dès le premier 401) et ça ne faisait qu'amplifier le nombre de requêtes en
            // échec visibles dans la console à chaque montage/focus/reconnexion.
            retry: (failureCount, error) =>
              !(axios.isAxiosError(error) && error.response?.status === 401) && failureCount < 3,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
