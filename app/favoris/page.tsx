'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Bookmark } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useProperties } from '@/features/search/hooks/use-properties';
import { useToggleFavorite } from '@/features/search/hooks/use-favorites';
import { formatPrice } from '@/features/search/utils/format-price';
import { RightRail } from '@/features/feed/components/right-rail';
import type { Property } from '@/features/search/types/listing.types';

/** Ligne compacte (petite image, titre/lieu/prix) — volontairement plus légère que la carte du
 *  fil (voir FeedPropertyCard) : demandé explicitement, une liste d'annonces déjà choisies n'a pas
 *  besoin du même niveau de détail (auteur, j'aime, menu...) qu'un fil de découverte. */
function FavoriteListItem({ property, onRemove }: { property: Property; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-2.5">
      <Link href={`/annonce/${property.id}`} className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-stroke-default">
        {property.mainPhotoUrl && <Image src={property.mainPhotoUrl} alt={property.title} fill className="object-cover" />}
      </Link>
      <Link href={`/annonce/${property.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-content-main truncate">{property.title}</p>
        <p className="text-[0.85rem] text-content-muted flex items-center gap-1 mt-0.5 min-w-0">
          <MapPin size={11} className="shrink-0 text-brand-primary" />
          <span className="truncate">{property.location}</span>
        </p>
        <p className="text-sm font-bold text-brand-secondary-text mt-0.5">{formatPrice(property.price)}</p>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer des favoris"
        className="shrink-0 p-2 text-brand-primary"
      >
        <Bookmark size={18} className="fill-brand-primary" />
      </button>
    </div>
  );
}

// Demandé explicitement après un retour sur la lenteur : la version précédente faisait une
// requête réseau PAR annonce enregistrée (une liste d'ids locale, sans détail). Le backend a un
// filtre dédié (`favoritesOf`, voir strImmo/src/properties/dto/list-properties-query.dto.ts) pour
// tout récupérer en une seule requête groupée — condition : les favoris doivent être de vrais
// favoris côté serveur (voir use-favorites.ts), pas un stockage local par navigateur. Nécessite
// donc un compte, comme "Mes biens".
export default function FavorisPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const { mutate: toggleFavorite } = useToggleFavorite();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  const { data: properties, isLoading } = useProperties(user ? { favoritesOf: user.id } : undefined, {
    enabled: !!user,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.favoritesPage.title}</h1>

        {isLoading ? (
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        ) : properties && properties.length > 0 ? (
          <div className="space-y-2">
            {properties.map((property) => (
              <FavoriteListItem
                key={property.id}
                property={property}
                onRemove={() => toggleFavorite({ propertyId: property.id, wasSaved: true })}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center px-4">
            <Heart size={32} className="text-content-muted" />
            <p className="font-semibold text-content-main">{t.favoritesPage.emptyTitle}</p>
            <p className="text-sm text-content-muted">{t.favoritesPage.emptyDescription}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-semibold rounded-xl px-3.5 py-2 transition mt-1"
            >
              {t.favoritesPage.browse}
            </Link>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
