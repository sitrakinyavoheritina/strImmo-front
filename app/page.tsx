import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeClient } from './home-client';
import { fetchProperties } from '@/lib/seo/api';
import { getGeoPages } from '@/lib/seo/geo';
import { SITE_DESCRIPTION, SITE_TITLE, absoluteUrl } from '@/lib/seo/site';
import { TYPE_INFO } from '@/lib/seo/slug';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: { url: absoluteUrl('/'), title: SITE_TITLE, description: SITE_DESCRIPTION, type: 'website', siteName: 'Onina', locale: 'fr_MG' },
};

// Accueil : le fil reste un composant client (filtres, scroll infini), mais la première page
// d'annonces est chargée ici, côté serveur — le HTML contient donc de vraies annonces et leurs
// liens. Le bloc de texte + liens sous le fil relie l'accueil aux catégories et aux communes.
export default async function HomePage() {
  const [initialProperties, geoPages] = await Promise.all([
    fetchProperties({ sortBy: 'recent', limit: 12, offset: 0 }),
    getGeoPages(),
  ]);

  return (
    <>
      <h1 className="sr-only">Onina, l’immobilier à Madagascar : maisons, appartements, villas et terrains à vendre ou à louer</h1>
      <HomeClient initialProperties={initialProperties} />
      {/* Bloc de texte SEO : masqué à l'écran partout (mobile et ordinateur) — `sr-only` le garde
          lisible par les lecteurs d'écran et les robots sans occuper de place. Les liens vers les
          catégories sont visibles dans la colonne de droite (CategoryGrid). */}
      <section className="sr-only">
        <h2 className="text-sm font-bold text-content-main mb-1.5">L’immobilier à Madagascar avec Onina</h2>
        <p className="max-w-3xl leading-relaxed">
          Onina met en relation propriétaires, acheteurs et locataires : parcourez les annonces de
          maisons, d’appartements, de villas et de terrains à vendre ou à louer à Madagascar.
        </p>
        {geoPages.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-3">
            {geoPages.slice(0, 8).map((page) => (
              <li key={`${page.propertyType}-${page.slug}`}>
                <Link
                  href={`/${TYPE_INFO[page.propertyType].slug}/${page.slug}`}
                  className="inline-block rounded-full border border-stroke-default bg-surface-card px-3 py-1.5 text-[0.85rem] text-content-main hover:border-brand-primary hover:text-brand-primary transition"
                >
                  {TYPE_INFO[page.propertyType].plural} – {page.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
