import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoListingPage } from '@/features/seo/components/seo-listing-page';
import { fetchProperties } from '@/lib/seo/api';
import { getGeoPages } from '@/lib/seo/geo';
import { SITE_NAME, absoluteUrl } from '@/lib/seo/site';
import { TYPE_INFO, typeFromSlug } from '@/lib/seo/slug';

export const revalidate = 300;

type Params = { categorie: string; ville: string };

// Une page commune n'existe que pour une commune qui a au moins MIN_LISTINGS_FOR_GEO_PAGE
// annonces approuvées de ce type (voir lib/seo/geo.ts) — sinon 404, jamais une page vide.
async function resolve(params: Promise<Params>) {
  const { categorie, ville } = await params;
  const type = typeFromSlug(categorie);
  if (!type) return null;
  const page = (await getGeoPages()).find((item) => item.propertyType === type && item.slug === ville);
  return page ? { type, page } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return { robots: { index: false } };
  const { type, page } = resolved;
  const info = TYPE_INFO[type];
  const title = `${info.plural} à vendre et à louer – ${page.label}`;
  const description = `${page.count} annonce${page.count > 1 ? 's' : ''} de ${info.plural.toLowerCase()} à vendre et à louer à ${page.label}, Madagascar, sur ${SITE_NAME}. Prix, photos et contact direct.`;
  const url = absoluteUrl(`/${info.slug}/${page.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, title: `${title} | ${SITE_NAME}`, description, url, locale: 'fr_MG' },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description },
  };
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { type, page } = resolved;
  const info = TYPE_INFO[type];
  const properties = await fetchProperties({ propertyType: type, communeId: page.communeId, sortBy: 'recent' });

  return (
    <SeoListingPage
      type={type}
      properties={properties}
      currentGeoSlug={page.slug}
      heading={`${info.plural} à vendre et à louer – ${page.label}`}
      intro={`${page.count} annonce${page.count > 1 ? 's' : ''} de ${info.plural.toLowerCase()} à ${page.label} sur Onina, à vendre ou à louer. Comparez les prix et les caractéristiques, puis contactez directement l’annonceur.`}
      breadcrumbs={[
        { name: 'Accueil', path: '/' },
        { name: info.plural, path: `/${info.slug}` },
        { name: page.label, path: `/${info.slug}/${page.slug}` },
      ]}
    />
  );
}
