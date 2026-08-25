import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSearch } from '@/components/search/hero-search';
import { PropertyCard } from '@/components/property/property-card';
import { FeatureCard } from '@/components/ui/feature-card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-app text-slate-800">

      <main className="flex-1">
        <HeroSearch />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-content-main">
                Annonces récentes
              </h2>
              <p className="text-content-muted text-sm">
                Découvrez les derniers biens immobiliers publiés sur Onina.
              </p>
            </div>
            <Link
              href="/recherche"
              className="text-sm font-semibold text-brand-primary hover:text-blue-700 hidden sm:block"
            >
              Voir tout $\rightarrow$
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PropertyCard
              title="Villa T4 moderne avec jardin"
              price="1 500 000 Ar"
              priceUnit="/ mois"
              location="Ivandry, Antananarivo"
              type="location"
              bedrooms={3}
              bathrooms={2}
              area={150}
            />
            <PropertyCard
              title="Appartement T3 en centre-ville"
              price="280 000 000 Ar"
              location="Isoraka, Antananarivo"
              type="vente"
              bedrooms={2}
              bathrooms={1}
              area={80}
            />
            <PropertyCard
              title="Terrain titré-borné de 500 m²"
              price="95 000 000 Ar"
              location="Ambohibao, Antananarivo"
              type="vente"
              area={500}
            />
          </div>
        </section>

        <section className="bg-surface-card border-y border-stroke-default/80 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-content-main">
                Pourquoi choisir Onina ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔍"
                title="Annonces Vérifiées"
                description="Nous modérons chaque annonce pour vous garantir des informations fiables."
              />
              <FeatureCard
                icon="📱"
                title="Contact Direct"
                description="Mise en relation rapide avec les propriétaires et les agences immobilières."
              />
              <FeatureCard
                icon="🇲🇬"
                title="100% Local"
                description="Une interface optimisée pour le marché et les usages à Madagascar."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}