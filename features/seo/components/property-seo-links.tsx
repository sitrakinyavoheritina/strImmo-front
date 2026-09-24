import Link from 'next/link';
import { fetchProperties } from '@/lib/seo/api';
import { getGeoPages } from '@/lib/seo/geo';
import { TYPE_INFO, propertyPath } from '@/lib/seo/slug';
import { formatPrice } from '@/features/search/utils/format-price';
import type { Property } from '@/features/search/types/listing.types';

/** Liens internes sous une fiche d'annonce (composant serveur, présent dans le HTML) : fil
 * d'Ariane vers la catégorie et la commune, puis annonces similaires. Permet à Google de parcourir
 * le contenu public de proche en proche. */
export async function PropertySeoLinks({ property }: { property: Property }) {
  const typeInfo = TYPE_INFO[property.propertyType];
  const [similarRaw, geoPages] = await Promise.all([
    fetchProperties({ propertyType: property.propertyType, communeId: property.communeId, sortBy: 'recent', limit: 7 }),
    property.communeId ? getGeoPages() : Promise.resolve([]),
  ]);
  const similar = similarRaw.filter((item) => item.id !== property.id).slice(0, 6);
  const geoPage = geoPages.find(
    (page) => page.communeId === property.communeId && page.propertyType === property.propertyType
  );

  return (
    <section className="px-3 sm:px-6 lg:px-4 pb-24 lg:pb-10 max-w-5xl mx-auto w-full">
      <nav aria-label="Fil d’Ariane" className="text-[0.85rem] text-content-muted flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-brand-primary">Accueil</Link>
        <span>›</span>
        <Link href={`/${typeInfo.slug}`} className="hover:text-brand-primary">{typeInfo.plural}</Link>
        {geoPage && (
          <>
            <span>›</span>
            <Link href={`/${typeInfo.slug}/${geoPage.slug}`} className="hover:text-brand-primary">
              {property.communeName}
            </Link>
          </>
        )}
      </nav>

      {similar.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-bold text-content-main mb-2">Annonces similaires</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {similar.map((item) => (
              <li key={item.id}>
                <Link
                  href={propertyPath(item)}
                  className="block bg-surface-card border border-stroke-default/80 rounded-xl p-3 hover:border-brand-primary/40 transition"
                >
                  <span className="block text-sm font-semibold text-content-main">{item.title}</span>
                  <span className="block text-[0.85rem] text-content-muted">{item.location}</span>
                  <span className="block text-sm font-bold text-brand-secondary-text">{formatPrice(item.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
