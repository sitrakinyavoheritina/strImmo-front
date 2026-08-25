'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const { t } = useTranslation();
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  return (
    <header className="sticky top-0 z-50 bg-surface-card/95 backdrop-blur border-b border-stroke-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-brand-primary text-white font-bold text-xl flex items-center justify-center shadow-md shadow-brand-primary/20">
            O
          </span>
          <span className="text-xl font-bold text-content-main tracking-tight">
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
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
    </header>
  );
};
