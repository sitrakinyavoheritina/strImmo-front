import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoListingPage } from '@/features/seo/components/seo-listing-page';
import { fetchProperties } from '@/lib/seo/api';
import { SITE_NAME, absoluteUrl } from '@/lib/seo/site';
import { TYPE_INFO, typeFromSlug, type SeoPropertyType } from '@/lib/seo/slug';

// Seules les 4 catégories existent (/maison, /appartement, /villa, /terrain) — tout autre segment
// est un 404. Rendu à la demande avec cache de 5 minutes (voir lib/seo/api.ts).
export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return (Object.keys(TYPE_INFO) as SeoPropertyType[]).map((type) => ({ categorie: TYPE_INFO[type].slug }));
}

type Params = { categorie: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const type = typeFromSlug((await params).categorie);
  if (!type) return {};
  const info = TYPE_INFO[type];
  const properties = await fetchProperties({ propertyType: type });
  const title = `${info.plural} à vendre et à louer à Madagascar`;
  const description = `${properties.length > 0 ? `${properties.length} annonce${properties.length > 1 ? 's' : ''} : ` : ''}${info.plural.toLowerCase()} à vendre et à louer à Madagascar sur ${SITE_NAME}, la plateforme immobilière qui met en relation propriétaires, acheteurs et locataires.`;
  const url = absoluteUrl(`/${info.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    // Sans aucune annonce, la page serait vide : pas d'indexation.
    robots: properties.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: { type: 'website', siteName: SITE_NAME, title: `${title} | ${SITE_NAME}`, description, url, locale: 'fr_MG' },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const type = typeFromSlug((await params).categorie);
  if (!type) notFound();
  const info = TYPE_INFO[type];
  const properties = await fetchProperties({ propertyType: type, sortBy: 'recent' });

  return (
    <SeoListingPage
      type={type}
      properties={properties}
      heading={`${info.plural} à vendre et à louer à Madagascar`}
      intro={`Parcourez les annonces de ${info.plural.toLowerCase()} publiées sur Onina, à vendre ou à louer à Madagascar. ${
        properties.length > 0
          ? `${properties.length} annonce${properties.length > 1 ? 's sont' : ' est'} actuellement disponible${properties.length > 1 ? 's' : ''}.`
          : ''
      } Chaque annonce indique le prix, la localisation et les caractéristiques du bien, et vous permet de contacter directement le propriétaire, l’intermédiaire ou l’agence.`}
      breadcrumbs={[
        { name: 'Accueil', path: '/' },
        { name: info.plural, path: `/${info.slug}` },
      ]}
    />
  );
}
