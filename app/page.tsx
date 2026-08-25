'use client';

import Link from 'next/link';
import { HeroSearch } from '@/components/search/hero-search';
import { PropertyCard } from '@/components/property/property-card';
import { FeatureCard } from '@/components/ui/feature-card';
import { MOCK_PROPERTIES } from '@/lib/mock/properties';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-app text-content-main">

      <main className="flex-1">
        <HeroSearch />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-content-main">
                {t.home.recentListings}
              </h2>
              <p className="text-content-muted text-sm">
                {t.home.recentListingsDesc}
              </p>
            </div>
            <Link
              href="/recherche"
              className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover hidden sm:block"
            >
              {t.home.viewAll} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROPERTIES.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </section>

        <section className="bg-surface-card border-y border-stroke-default/80 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-content-main">
                {t.home.whyChoose}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔍"
                title={t.home.verifiedTitle}
                description={t.home.verifiedDesc}
              />
              <FeatureCard
                icon="📱"
                title={t.home.contactTitle}
                description={t.home.contactDesc}
              />
              <FeatureCard
                icon="🇲🇬"
                title={t.home.localTitle}
                description={t.home.localDesc}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
