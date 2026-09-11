'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // `useState` plutôt qu'une constante au niveau module : garantit une instance par session
  // client (pas de partage de cache entre requêtes serveur différentes en cas de SSR futur).
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
