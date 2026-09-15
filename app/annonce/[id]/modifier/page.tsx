'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useProperty } from '@/features/search/hooks/use-property';
import { EditPropertyForm } from '@/features/listings/components/edit-property-form';
import { Button } from '@/components/ui/button';

// Modifier une annonce déjà publiée (propriétaire ou admin uniquement) — permet notamment de
// corriger une annonce refusée : la sauvegarde la repasse automatiquement "en attente" côté
// serveur (voir strImmo/src/properties/properties.service.ts:update), pas la peine de le refaire
// manuellement ici.
export default function ModifierAnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const { data: property, isLoading } = useProperty(id);

  const isOwner = user?.id === property?.ownerId;
  const isAdminUser = user?.role === 'admin' || user?.role === 'superadmin';

  // Attend `hasHydrated` (session relue depuis localStorage) avant de rediriger — sinon, sur un
  // chargement direct de cette page, `isAuthenticated` vaut encore `false` le temps de la
  // réhydratation et un utilisateur pourtant déjà connecté serait renvoyé à tort vers
  // /connexion (même piège que app/annonce/nouvelle/page.tsx). Idem pour la vérification
  // propriétaire/admin, qui dépend en plus de l'annonce chargée (`property`).
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/connexion');
      return;
    }
    if (!isLoading && property && !isOwner && !isAdminUser) {
      router.replace(`/annonce/${id}`);
    }
  }, [hasHydrated, isAuthenticated, isLoading, property, isOwner, isAdminUser, id, router]);

  if (!hasHydrated || !isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-content-muted">{t.search.searching}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-content-main">{t.propertyDetail.notFoundTitle}</h1>
        <Link href="/" className="inline-block mt-4">
          <Button size="sm">{t.propertyDetail.backHome}</Button>
        </Link>
      </div>
    );
  }

  if (!isOwner && !isAdminUser) return null;

  return (
    <div className="max-w-md mx-auto px-3 sm:px-6 lg:px-0 py-3 sm:py-6">
      <Link
        href={`/annonce/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
      >
        <ArrowLeft size={16} />
        {t.propertyDetail.back}
      </Link>
      <h1 className="text-lg font-bold text-brand-secondary-text mb-1">{t.listing.editListingTitle}</h1>
      {property.moderationStatus === 'rejected' && (
        <p className="text-xs text-content-muted mb-4">{t.listing.editRejectedNotice}</p>
      )}
      {property.moderationStatus !== 'rejected' && <div className="mb-4" />}

      <EditPropertyForm property={property} />
    </div>
  );
}
