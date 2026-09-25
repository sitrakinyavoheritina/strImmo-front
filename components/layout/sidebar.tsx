'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useUnreadMessagesCount } from '@/features/messages/hooks/use-messages';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { getNavItems, isNavItemActive } from './nav-items';
import { SidebarAdvancedFilters } from './sidebar-advanced-filters';

/** Colonne de navigation gauche, persistante à partir de `lg:`. Sur l'accueil et la page de
 * résultats (/recherche), les filtres avancés de recherche sont affichés directement en bas (pas besoin d'ouvrir le modal
 * de la barre de recherche pour y accéder). */
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  // Accueil et page de résultats : mêmes filtres avancés (le store est synchronisé avec l'URL sur
  // /recherche, voir app/recherche/page.tsx).
  const showAdvancedFilters = pathname === '/' || pathname.startsWith('/recherche');
  const unreadCount = useUnreadMessagesCount();
  const user = useAuthStore((state) => state.user);
  const navItems = getNavItems(isAdmin(user));

  return (
    <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-[4.5rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto my-4 ml-4 bg-surface-card border border-stroke-default rounded-2xl shadow-sm py-4 px-3">
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-primary-soft text-brand-primary'
                  : 'text-content-muted hover:bg-surface-app hover:text-content-main'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              {t.sidebar[labelKey]}
              {href === '/messages' && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-[12px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {showAdvancedFilters && <SidebarAdvancedFilters />}
    </aside>
  );
}
