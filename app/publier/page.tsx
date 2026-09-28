'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ClipboardList, Home } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';

// Écran de choix ouvert par le bouton "+" de la topbar (voir components/layout/topbar.tsx) :
// publier une offre (parcours existant, /annonce/nouvelle) ou publier une demande (nouveau
// parcours, /demandes/nouvelle). Une explication en malgache est affichée sous chaque carte, en
// plus du français — remonté explicitement après un test où le français seul n'était pas assez
// clair pour certains utilisateurs, exception au principe habituel d'un seul texte selon la
// langue choisie (bouton FR/MG en haut) — mise en avant dans son propre encadré coloré, en texte
// de taille normale (pas une petite note en bas de carte), pour qu'elle se voie vraiment.
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
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-semibold text-content-muted hover:text-content-main mb-4"
      >
        <ArrowLeft size={20} />
        {t.listing.back}
      </button>

      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary-text text-center">
        {t.publishChoicePage.title}
      </h1>
      <p className="text-sm text-content-muted text-center mt-1.5">{t.publishChoicePage.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
        <Link
          href="/annonce/nouvelle"
          className="group text-left bg-surface-card border-2 border-stroke-default/80 rounded-2xl p-5 hover:border-brand-primary hover:shadow-lg transition-all"
        >
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary-soft text-brand-primary mb-3.5">
            <Home size={26} />
          </span>
          <p className="font-bold text-content-main text-base">{t.publishChoicePage.offerTitle}</p>
          <p className="text-sm text-content-muted mt-1">{t.publishChoicePage.offerSubtitle}</p>

          <p className="mt-3.5 rounded-xl bg-surface-app px-3 py-2.5 text-sm text-content-main">
            {t.publishChoicePage.offerExplanationMg}
          </p>

          <span className="mt-3.5 flex items-center justify-between text-[0.85rem] font-semibold text-brand-primary">
            {t.publishChoicePage.choose}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/demandes/nouvelle"
          className="group text-left bg-surface-card border-2 border-stroke-default/80 rounded-2xl p-5 hover:border-brand-primary hover:shadow-lg transition-all"
        >
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary-soft text-brand-primary mb-3.5">
            <ClipboardList size={26} />
          </span>
          <p className="font-bold text-content-main text-base">{t.publishChoicePage.demandTitle}</p>
          <p className="text-sm text-content-muted mt-1">{t.publishChoicePage.demandSubtitle}</p>

          <p className="mt-3.5 rounded-xl bg-surface-app px-3 py-2.5 text-sm text-content-main">
            {t.publishChoicePage.demandExplanationMg}
          </p>

          <span className="mt-3.5 flex items-center justify-between text-[0.85rem] font-semibold text-brand-primary">
            {t.publishChoicePage.choose}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  );
}
