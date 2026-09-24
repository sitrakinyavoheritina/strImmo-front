'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { ConversationListPanel } from '@/features/messages/components/conversation-list-panel';
import { RightRail } from '@/features/feed/components/right-rail';

// Deux panneaux côte à côte (liste + fil) plutôt qu'une page dédiée par conversation — évite le
// blanc perdu et l'aller-retour de page à chaque conversation ouverte. Même convention que
// Messenger/WhatsApp Web. RightRail reste affiché à droite (comme sur les autres pages du site) :
// seul le bloc central passe en deux panneaux. En dessous de `lg:`, pas assez de largeur pour la
// liste et le fil : un seul panneau à la fois, celui qui correspond à la route active (liste sur
// /messages, fil sur /messages/[id]).
export function MessagesShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isThreadOpen = pathname !== '/messages';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();

  // Centralisé ici (pas dans page.tsx / [id]/page.tsx) : les deux partagent ce layout, pas besoin
  // de dupliquer la garde. Même règle que /annonce/nouvelle : pas de messagerie sans compte.
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      {/* En dessous de `lg:`, la bande de navigation est fixée en bas de l'écran (voir
          app-shell.tsx) : sans en retirer la hauteur ici aussi, le bas de ce panneau (la zone de
          saisie d'un fil ouvert) se retrouvait masqué derrière. */}
      <div className="flex-1 min-w-0 py-3 sm:py-6 h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-3.5rem)]">
        <div className="h-full bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex overflow-hidden">
          <div
            className={`w-full lg:w-80 shrink-0 lg:border-r border-stroke-default ${
              isThreadOpen ? 'hidden lg:block' : 'block'
            }`}
          >
            <ConversationListPanel />
          </div>
          <div className={`flex-1 min-w-0 flex-col ${isThreadOpen ? 'flex' : 'hidden lg:flex'}`}>{children}</div>
        </div>
      </div>
      <RightRail />
    </div>
  );
}
