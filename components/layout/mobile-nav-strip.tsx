'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useUnreadMessagesCount } from '@/features/messages/hooks/use-messages';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { getNavItems, isNavItemActive } from './nav-items';

/** Bande d'icônes fixée en bas de l'écran, visible en dessous de `lg:` (comme l'app mobile,
 * demandé explicitement) — plus sous la topbar. `pb-[var(--safe-bottom)]` évite qu'elle passe
 * sous la zone de gestes/l'encoche basse d'un téléphone ; voir app-shell.tsx pour la marge
 * réservée en bas des pages afin qu'aucun contenu ne se retrouve masqué derrière.
 *
 * Icône + libellé sous l'icône (pas icône seule) : même convention que l'app mobile de référence
 * (Onina-mobile/src/app/(tabs)/_layout.web.tsx), qui commente explicitement ce choix comme demandé
 * pour que chaque section soit identifiable sans ambiguïté — sans texte, un utilisateur ne
 * reconnaît pas "Accueil"/"Messages"/etc. dans une simple rangée d'icônes.
 *
 * Onglet actif = pastille de fond (icône + texte posés sur un fond arrondi coloré), pas juste une
 * couleur de texte différente — demandé explicitement pour que l'onglet actif se détache
 * nettement des autres plutôt que de se distinguer seulement par une nuance de couleur/graisse. */
export function MobileNavStrip() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const unreadCount = useUnreadMessagesCount();
  const user = useAuthStore((state) => state.user);
  const navItems = getNavItems(isAdmin(user));

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch bg-surface-card border-t border-stroke-default pb-[var(--safe-bottom)]">
      {navItems.map(({ href, icon: Icon, labelKey }) => {
        const isActive = isNavItemActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex-1 flex items-center justify-center py-1.5 min-h-12 transition active:bg-surface-app"
          >
            <span
              className={`flex flex-col items-center gap-0.5 px-3.5 py-1 rounded-2xl transition ${
                isActive ? 'bg-brand-primary-soft' : ''
              }`}
            >
              {/* `content-main` (pas `content-muted`) même inactif : un libellé de navigation
                  reste une information importante pour se repérer, pas un simple détail
                  secondaire — demandé explicitement après un retour sur sa lisibilité en thème
                  sombre. Seul l'icône, purement décorative une fois le texte lu, garde la nuance
                  discrète à l'état inactif. */}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.4 : 2}
                className={isActive ? 'text-brand-primary' : 'text-content-muted'}
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? 'font-bold text-brand-primary' : 'font-medium text-content-main'
                }`}
              >
                {t.sidebar[labelKey]}
              </span>
            </span>
            {href === '/messages' && unreadCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-14px)] w-2 h-2 rounded-full bg-danger" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
