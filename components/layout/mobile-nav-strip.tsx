'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useUnreadMessagesCount } from '@/features/messages/hooks/use-messages';
import { NAV_ITEMS, isNavItemActive } from './nav-items';

/** Bande d'icônes fixée en bas de l'écran, visible en dessous de `lg:` (comme l'app mobile,
 * demandé explicitement) — plus sous la topbar. `pb-[var(--safe-bottom)]` évite qu'elle passe
 * sous la zone de gestes/l'encoche basse d'un téléphone ; voir app-shell.tsx pour la marge
 * réservée en bas des pages afin qu'aucun contenu ne se retrouve masqué derrière. */
export function MobileNavStrip() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const unreadCount = useUnreadMessagesCount();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch bg-surface-card border-t border-stroke-default pb-[var(--safe-bottom)]">
      {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
        const isActive = isNavItemActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={t.sidebar[labelKey]}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex-1 flex items-center justify-center py-1.5 min-h-10 border-t-2 transition active:bg-surface-app ${
              isActive ? 'border-brand-primary' : 'border-transparent'
            }`}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.4 : 2}
              className={isActive ? 'text-brand-primary' : 'text-content-muted'}
            />
            {href === '/messages' && unreadCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-14px)] w-2 h-2 rounded-full bg-danger" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
