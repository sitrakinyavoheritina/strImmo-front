import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { AnnonceClient } from './annonce-client';
import { PropertySeoLinks } from '@/features/seo/components/property-seo-links';
import { fetchProperty } from '@/lib/seo/api';
import { breadcrumbJsonLd, propertyJsonLd, serializeJsonLd } from '@/lib/seo/json-ld';
import { SITE_NAME, absoluteUrl } from '@/lib/seo/site';
import { TYPE_INFO, extractPropertyId, propertyPath, propertyPathSegment } from '@/lib/seo/slug';
import { formatPrice } from '@/features/search/utils/format-price';
import type { Property } from '@/features/search/types/listing.types';

// Une seule requête API par rendu, partagée entre generateMetadata et la page.
const getProperty = cache((id: string) => fetchProperty(id));

type Params = { id: string };

function describe(property: Property): { title: string; description: string } {
  const type = TYPE_INFO[property.propertyType].singular;
  const kind = property.kind === 'rent' ? 'à louer' : 'à vendre';
  const details: string[] = [];
  if (property.propertyType === 'house') details.push(`${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`);
  else details.push(`${property.surfaceM2} m²`);

  const title = `${type} ${kind} à ${property.location} – ${details[0]} | ${SITE_NAME}`;
  const description =
    `${type} ${kind} à ${property.location} avec ${details[0]}, au prix de ${formatPrice(property.price)}` +
    `${property.kind === 'rent' ? ' par mois' : ''}. Découvrez les détails, photos et informations de cette annonce sur Onina.`;
  return { title, description };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const id = extractPropertyId((await params).id);
  if (!id) return { robots: { index: false } };
  const result = await getProperty(id);
  if (result.status !== 'ok') return { robots: { index: false } };

  const { property } = result;
  const { title, description } = describe(property);
  const url = absoluteUrl(propertyPath(property));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Seules les annonces validées par la modération sont indexables.
    robots: property.moderationStatus === 'approved' ? undefined : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'fr_MG',
      images: property.mainPhotoUrl ? [{ url: property.mainPhotoUrl, alt: property.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: property.mainPhotoUrl ? [property.mainPhotoUrl] : undefined,
    },
  };
}

export default async function AnnoncePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: param } = await params;
  const id = extractPropertyId(param);
  if (!id) notFound();

  const result = await getProperty(id);
  if (result.status === 'not_found') notFound();
  // API momentanément indisponible : le rendu client (React Query) prend le relais, sans faux 404.
  if (result.status === 'error') return <AnnonceClient id={id} />;

  const { property } = result;
  // URL canonique : un lien nu (`/annonce/<uuid>`) ou avec un ancien slug est redirigé (308, traité
  // comme une 301 par Google) vers la forme "maison-a-vendre-<lieu>-<uuid>", en gardant la query.
  if (decodeURIComponent(param) !== propertyPathSegment(property)) {
    const query = new URLSearchParams();
    Object.entries(await searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') query.set(key, value);
    });
    const suffix = query.toString();
    permanentRedirect(`${propertyPath(property)}${suffix ? `?${suffix}` : ''}`);
  }

  const typeInfo = TYPE_INFO[property.propertyType];
  const breadcrumbs = [
    { name: 'Accueil', path: '/' },
    { name: typeInfo.plural, path: `/${typeInfo.slug}` },
    { name: property.title, path: propertyPath(property) },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(propertyJsonLd(property)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <AnnonceClient id={id} initialProperty={property} />
      <PropertySeoLinks property={property} />
    </>
  );
}
