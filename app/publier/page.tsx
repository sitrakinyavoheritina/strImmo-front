'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search as SearchIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';

// Écran de choix ouvert par le bouton "+" de la topbar (voir components/layout/topbar.tsx) :
// publier une offre (parcours existant, /annonce/nouvelle) ou publier une demande (nouveau
// parcours, /demandes/nouvelle). Une explication en malgache est affichée sous chaque carte, en
// plus du français — remonté explicitement après un test où le français seul n'était pas assez
// clair pour certains utilisateurs, exception au principe habituel d'un seul texte selon la
// langue choisie (bouton FR/MG en haut).
export default function PublierPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text text-center mb-6">
        {t.publishChoicePage.title}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/annonce/nouvelle"
          className="text-left bg-surface-card border border-stroke-default/80 rounded-2xl p-4 hover:border-brand-primary hover:shadow-sm transition"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary-soft text-brand-primary mb-2.5">
            <Home size={20} />
          </span>
          <p className="font-semibold text-content-main text-sm">{t.publishChoicePage.offerTitle}</p>
          <p className="text-[0.85rem] text-content-muted mt-0.5">{t.publishChoicePage.offerSubtitle}</p>
          <p className="text-[0.8rem] text-content-muted mt-2 italic border-t border-stroke-default/60 pt-2">
            {t.publishChoicePage.offerExplanationMg}
          </p>
        </Link>

        <Link
          href="/demandes/nouvelle"
          className="text-left bg-surface-card border border-stroke-default/80 rounded-2xl p-4 hover:border-brand-primary hover:shadow-sm transition"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary-soft text-brand-primary mb-2.5">
            <SearchIcon size={20} />
          </span>
          <p className="font-semibold text-content-main text-sm">{t.publishChoicePage.demandTitle}</p>
          <p className="text-[0.85rem] text-content-muted mt-0.5">{t.publishChoicePage.demandSubtitle}</p>
          <p className="text-[0.8rem] text-content-muted mt-2 italic border-t border-stroke-default/60 pt-2">
            {t.publishChoicePage.demandExplanationMg}
          </p>
        </Link>
      </div>
    </div>
  );
}
