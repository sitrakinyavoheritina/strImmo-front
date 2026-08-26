'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { LanguageMenu } from '@/components/ui/language-menu';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  const tabs = [
    { href: '/', icon: '🏠', label: t.mobileNav.home },
    { href: '/recherche', icon: '🔍', label: t.mobileNav.search },
    { href: '/favoris', icon: '🤍', label: t.mobileNav.favorites, badge: favoritesCount },
    { href: '/messages', icon: '💬', label: t.mobileNav.messages },
    { href: '/connexion', icon: '👤', label: t.mobileNav.account },
  ];

  return (
    <header
      className="sticky top-0 z-50 bg-surface-card/95 backdrop-blur border-b border-stroke-default"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-primary text-white font-bold text-sm sm:text-xl flex items-center justify-center shadow-md shadow-brand-primary/20">
            O
          </span>
          <span className="text-sm sm:text-xl font-bold text-content-main tracking-tight">
            Onina<span className="text-brand-primary">.mg</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-content-muted">
          <Link href="/recherche?type=location" className="hover:text-brand-primary transition">
            {t.nav.rent}
          </Link>
          <Link href="/recherche?type=vente" className="hover:text-brand-primary transition">
            {t.nav.buy}
          </Link>
          <Link href="/projets" className="hover:text-brand-primary transition">
            {t.nav.newProjects}
          </Link>
          <Link href="/agences" className="hover:text-brand-primary transition">
            {t.nav.agencies}
          </Link>
          <Link href="/favoris" className="relative hover:text-brand-primary transition">
            {t.nav.favorites}
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-secondary text-white text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Desktop : sélecteur toujours visible. Mobile : icône discrète + menu, pour laisser la place au contenu. */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <div className="md:hidden">
            <LanguageMenu />
          </div>
          <Link
            href="/connexion"
            className="px-4 py-2 text-sm font-semibold text-content-muted hover:text-brand-primary transition hidden sm:block"
          >
            {t.nav.login}
          </Link>
          <Link href="/inscription">
            <Button size="sm">{t.nav.register}</Button>
          </Link>
        </div>
      </div>

      {/* Onglets de navigation mobile, en haut (façon Facebook) plutôt qu'en barre fixe basse */}
      <nav className="md:hidden flex items-stretch border-t border-stroke-default">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 flex items-center justify-center py-1.5 min-h-10 border-b-2 transition active:bg-surface-app ${
                isActive ? 'border-brand-primary' : 'border-transparent'
              }`}
            >
              <span className={`text-lg leading-none transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.icon}
              </span>
              {!!tab.badge && (
                <span className="absolute top-0.5 right-1/4 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
