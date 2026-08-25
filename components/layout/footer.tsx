'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';

export const Footer = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Ne pas afficher le Footer si on n'est pas sur la page d'accueil "/"
  if (pathname !== '/') {
    return null;
  }

  return (
    /* hidden sur mobile, block à partir de l'écran moyen (md) */
    <footer className="hidden md:block bg-surface-dark text-content-muted py-12 border-t border-stroke-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <span className="text-xl font-bold text-white tracking-tight">
            Onina<span className="text-brand-primary">.mg</span>
          </span>
          <p className="text-xs text-content-muted leading-relaxed">{t.footer.tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{t.footer.buyRentTitle}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/recherche?type=location" className="hover:text-white transition">{t.footer.apartmentsRent}</Link></li>
            <li><Link href="/recherche?type=vente" className="hover:text-white transition">{t.footer.housesSale}</Link></li>
            <li><Link href="/recherche?type=terrain" className="hover:text-white transition">{t.footer.titledLand}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{t.footer.mainCities}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/recherche?ville=antananarivo" className="hover:text-white transition">Antananarivo</Link></li>
            <li><Link href="/recherche?ville=tamatave" className="hover:text-white transition">Tamatave</Link></li>
            <li><Link href="/recherche?ville=majunga" className="hover:text-white transition">Majunga</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{t.footer.infoTitle}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/a-propos" className="hover:text-white transition">{t.footer.about}</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">{t.footer.contact}</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stroke-default text-center text-xs text-content-muted">
        © {new Date().getFullYear()} Onina.mg. {t.footer.rights}
      </div>
    </footer>
  );
};
