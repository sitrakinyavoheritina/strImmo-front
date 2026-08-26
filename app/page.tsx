'use client';

import { HeroSearch } from '@/components/search/hero-search';
import { PropertyRail } from '@/components/property/property-rail';
import { FeatureCard } from '@/components/ui/feature-card';
import { MOCK_PROPERTIES, POPULAR_PROPERTIES } from '@/lib/mock/properties';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-app text-content-main">

      <main className="flex-1">
        <HeroSearch />

        <PropertyRail
          title={t.home.recentListings}
          description={t.home.recentListingsDesc}
          properties={MOCK_PROPERTIES}
          viewAllHref="/recherche"
          viewAllLabel={t.home.viewAll}
        />

        <PropertyRail
          title={t.home.popularListings}
          description={t.home.popularListingsDesc}
          properties={POPULAR_PROPERTIES}
          viewAllHref="/recherche?sort=popular"
          viewAllLabel={t.home.viewAll}
          tone="tinted"
        />

        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-12">
              <h2 className="text-lg sm:text-2xl font-bold text-content-main">
                {t.home.whyChoose}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
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
