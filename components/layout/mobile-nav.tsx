'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Accueil', href: '/', icon: '🏠' },
    { label: 'Recherche', href: '/recherche', icon: '🔍' },
    { label: 'Favoris', href: '/favoris', icon: '🤍' },
    { label: 'Messages', href: '/messages', icon: '💬' },
    { label: 'Compte', href: '/connexion', icon: '👤' },
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
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition ${
                isActive ? 'text-brand-primary font-bold' : 'text-content-muted'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};