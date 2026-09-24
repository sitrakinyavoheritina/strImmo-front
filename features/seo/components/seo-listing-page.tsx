import Link from 'next/link';
import { FeedList } from '@/features/feed/components/feed-list';
import { getGeoPages } from '@/lib/seo/geo';
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/json-ld';
import { TYPE_INFO, type SeoPropertyType } from '@/lib/seo/slug';
import type { Property } from '@/features/search/types/listing.types';

/** Page SEO d'une catégorie (`/maison`) ou d'une commune (`/maison/<commune>`) : H1, texte
 * d'introduction bâti sur les vraies données (nombre d'annonces), liste des annonces, liens vers
 * les communes et les autres catégories. Composant serveur — tout est dans le HTML. */
export async function SeoListingPage({
  type,
  properties,
  heading,
  intro,
  breadcrumbs,
  currentGeoSlug,
}: {
  type: SeoPropertyType;
  properties: Property[];
  heading: string;
  intro: string;
  breadcrumbs: { name: string; path: string }[];
  currentGeoSlug?: string;
}) {
  const geoPages = (await getGeoPages()).filter((page) => page.propertyType === type && page.slug !== currentGeoSlug);
  const otherTypes = (Object.keys(TYPE_INFO) as SeoPropertyType[]).filter((other) => other !== type);
  const info = TYPE_INFO[type];

  return (
    <div className="px-3 sm:px-6 lg:px-4 py-4 sm:py-6 max-w-5xl mx-auto w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <nav aria-label="Fil d’Ariane" className="text-[0.85rem] text-content-muted flex flex-wrap items-center gap-1.5 mb-3">
        {breadcrumbs.map((item, index) => (
          <span key={item.path} className="flex items-center gap-1.5">
            {index > 0 && <span>›</span>}
            {index < breadcrumbs.length - 1 ? (
              <Link href={item.path} className="hover:text-brand-primary">{item.name}</Link>
            ) : (
              <span className="text-content-main font-semibold">{item.name}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-brand-secondary-text">{heading}</h1>
      <p className="text-sm text-content-muted mt-2 max-w-3xl leading-relaxed">{intro}</p>

      <div className="mt-5">
        {properties.length > 0 ? (
          <FeedList properties={properties} />
        ) : (
          <p className="text-sm text-content-muted py-10 text-center">Aucune annonce disponible pour le moment.</p>
        )}
      </div>

      {geoPages.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-content-main mb-2">{info.plural} par commune</h2>
          <ul className="flex flex-wrap gap-2">
            {geoPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${info.slug}/${page.slug}`}
                  className="inline-block rounded-full border border-stroke-default bg-surface-card px-3 py-1.5 text-[0.85rem] hover:border-brand-primary hover:text-brand-primary transition"
                >
                  {page.label} ({page.count})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-bold text-content-main mb-2">Autres types de biens</h2>
        <ul className="flex flex-wrap gap-2">
          {otherTypes.map((other) => (
            <li key={other}>
              <Link
                href={`/${TYPE_INFO[other].slug}`}
                className="inline-block rounded-full border border-stroke-default bg-surface-card px-3 py-1.5 text-[0.85rem] hover:border-brand-primary hover:text-brand-primary transition"
              >
                {TYPE_INFO[other].plural} à Madagascar
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
