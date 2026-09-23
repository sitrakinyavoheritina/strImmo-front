'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { CardOptionsMenu } from './card-options-menu';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLikesStore } from '@/lib/state/use-likes-store';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useLikeProperty } from '@/features/search/hooks/use-like-property';
import { formatPrice, getPriceSuffix } from '@/features/search/utils/format-price';
import { formatRelativeTime } from '@/features/search/utils/format-relative-time';
import type { Property } from '@/features/search/types/listing.types';

const PUBLISHER_LABEL_KEY = {
  owner: 'publisherOwner',
  agent: 'publisherAgent',
  agency: 'publisherAgency',
} as const;

function formatCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);
}

// Variante "liste" de FeedPropertyCard — même contenu, même interactions (j'aime, discuter, menu
// "..."), juste réagencé en ligne horizontale façon Mes Biens/Favoris plutôt qu'en carte avec
// grande photo — à l'essai sur l'accueil uniquement (voir feed-list.tsx : `variant="list"`),
// FeedPropertyCard reste inchangée et utilisée partout ailleurs. Revenir en arrière : retirer
// `variant="list"` dans app/page.tsx, rien d'autre à toucher.
export function FeedPropertyRow({ property }: { property: Property }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cover = property.mainPhotoUrl;
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const isLiked = useLikesStore((state) => (userId ? state.likedByUser[userId] : undefined)?.includes(property.id) ?? false);
  const { mutate: toggleLike } = useLikeProperty();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdminUser = isAdmin(user);

  function handleChatClick() {
    router.push(isAuthenticated ? `/annonce/${property.id}?chat=1` : '/connexion');
  }

  function handleLikeClick() {
    if (!isAuthenticated || !userId) {
      router.push('/connexion');
      return;
    }
    toggleLike({ id: property.id, wasLiked: isLiked, userId });
  }

  return (
    <article className="relative flex gap-3 bg-surface-card rounded-xl border border-stroke-default/80 shadow-sm p-2.5">
      {/* `min-h` (pas `h` fixe) + `self-stretch` : quand le titre/lieu passent sur 2 lignes et que
          la colonne de contenu devient plus haute que la miniature, la ligne entière grandit pour
          s'adapter au texte — sans `self-stretch`, la miniature restait bloquée à sa hauteur fixe
          et laissait un vide en dessous. */}
      <Link
        href={`/annonce/${property.id}`}
        className="relative w-32 min-h-32 sm:w-40 sm:min-h-40 self-stretch shrink-0 rounded-lg overflow-hidden bg-stroke-default"
      >
        {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Emplacement fixe pour Propriétaire/Intermédiaire/Agence, avec le badge Location/Vente et
            "il y a Xj" regroupés juste à côté — demandé explicitement (ils étaient chacun fixés à
            un coin opposé, avec un grand vide entre les deux). */}
        <div className="flex items-center justify-between gap-2">
          {property.publisherType ? (
            <span className="text-[0.85rem] font-bold uppercase text-content-muted">
              {t.search[PUBLISHER_LABEL_KEY[property.publisherType]]}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-white ${
                property.kind === 'rent' ? 'bg-brand-primary' : 'bg-brand-secondary'
              }`}
            >
              {property.kind === 'rent' ? t.property.forRent : t.property.forSale}
            </span>
            <span className="text-[0.85rem] text-content-muted">{formatRelativeTime(property.createdAt)}</span>
          </div>
        </div>

        {/* `line-clamp-2` (pas 1) : un titre un peu long se lit sur deux lignes plutôt que d'être
            coupé à quelques mots — même chose pour le lieu juste en dessous — demandé explicitement
            après un retour sur des titres/lieux tronqués trop tôt. */}
        <Link href={`/annonce/${property.id}`} className="min-w-0 mt-1">
          <h3 className="text-sm font-semibold text-content-main line-clamp-2">{property.title}</h3>
        </Link>

        <p className="text-[0.85rem] text-content-main flex items-start gap-1 mt-0.5 min-w-0">
          <MapPin size={11} className="shrink-0 mt-0.5 text-brand-primary" />
          <span className="line-clamp-2">{property.location}</span>
        </p>

        <p className="text-sm font-bold text-brand-secondary-text mt-0.5">
          {formatPrice(property.price)}
          {getPriceSuffix(property) && <span className="font-normal text-content-muted">{getPriceSuffix(property)}</span>}
        </p>

        {/* Auteur à gauche, j'aime/discuter/"..." regroupés à droite sur la même ligne — ordre
            d'origine, demandé explicitement (le menu "..." était isolé plus loin à droite, séparé
            du cœur/message par un vide). */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
          {property.authorName ? (
            <Link href={`/profil/${property.ownerId}`} className="flex items-center gap-1.5 min-w-0 hover:underline">
              <Avatar name={property.authorName} imageUrl={property.authorAvatarUrl} size={18} />
              <span className="text-[0.85rem] font-semibold text-content-main truncate">@{property.authorName}</span>
            </Link>
          ) : (
            <span />
          )}
          {!isAdminUser && (
            <div className="flex items-center gap-2.5 text-[0.85rem] font-medium text-content-muted shrink-0">
              <button
                type="button"
                onClick={handleLikeClick}
                aria-label={isLiked ? t.property.unlike : t.property.like}
                aria-pressed={isLiked}
                className="flex items-center gap-1 hover:text-danger transition"
              >
                <Heart size={14} className={isLiked ? 'text-danger fill-danger' : ''} />
                {formatCount(property.likesCount)}
              </button>
              <button
                type="button"
                onClick={handleChatClick}
                aria-label={`${t.propertyDetail.chatWith} ${property.authorName ?? ''}`.trim()}
                className="hover:text-brand-primary transition"
              >
                <MessageCircle size={14} />
              </button>
              <CardOptionsMenu property={property} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
