'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';

export const MobileNav = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  const navItems = [
    { label: t.mobileNav.home, href: '/', icon: '🏠' },
    { label: t.mobileNav.search, href: '/recherche', icon: '🔍' },
    { label: t.mobileNav.favorites, href: '/favoris', icon: '🤍', badge: favoritesCount },
    { label: t.mobileNav.messages, href: '/messages', icon: '💬' },
    { label: t.mobileNav.account, href: '/connexion', icon: '👤' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-stroke-default z-50 px-2 py-2 shadow-lg">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition ${
                isActive ? 'text-brand-primary font-bold' : 'text-content-muted'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {!!item.badge && (
                <span className="absolute top-0 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
