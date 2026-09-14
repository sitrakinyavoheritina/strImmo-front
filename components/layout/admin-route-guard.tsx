'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';

// Un compte admin/superadmin n'a accès qu'à ses propres écrans (tableau de bord, validation,
// toutes les annonces, réglages, fiche détail d'une annonce pour modérer) — tout le reste (fil
// d'accueil, messages, carte, favoris, mes biens, profil, recherche, publier une annonce...) lui
// est fermé, même en tapant l'URL directement ou en cliquant le logo — pas seulement masqué de la
// navigation (voir nav-items.ts), demandé explicitement après avoir constaté que ces routes
// restaient accessibles malgré la nav adaptée.
function isAllowedForAdmin(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true;
  if (pathname === '/validation' || pathname.startsWith('/validation/')) return true;
  if (pathname === '/parametres' || pathname.startsWith('/parametres/')) return true;
  if (pathname === '/connexion' || pathname.startsWith('/inscription')) return true;
  // `/annonce/nouvelle` (publier) reste fermé ; `/annonce/<id>` (fiche détail, nécessaire pour
  // valider/refuser) reste ouvert — voir la vérification explicite ci-dessous.
  if (pathname.startsWith('/annonce/') && pathname !== '/annonce/nouvelle') return true;
  return false;
}

/** Monte le contrôle d'accès admin une seule fois, pour toute l'app — ne rend rien. */
export function AdminRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAdmin(user) && !isAllowedForAdmin(pathname)) {
      router.replace('/admin');
    }
  }, [hasHydrated, user, pathname, router]);

  return null;
}
