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

// Carte façon post social pour une annonce, utilisée dans le fil d'accueil — données réelles
// (backend). Le badge en haut de la photo indique le type de compte (Propriétaire/Agence/
// Intermédiaire) quand connu — absent si le backend n'a pas renvoyé cette info (ex. annonce sans
// publieur chargé). Auteur + actions (favoris/commenter/menu) sont regroupés dans une seule ligne
// en bas de carte, plutôt que d'avoir un en-tête séparé.
export function FeedPropertyCard({ property }: { property: Property }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cover = property.mainPhotoUrl;
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const isLiked = useLikesStore((state) => (userId ? state.likedByUser[userId] : undefined)?.includes(property.id) ?? false);
  const { mutate: toggleLike } = useLikeProperty();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdminUser = isAdmin(user);

  // Même règle que sur la page détail (voir app/annonce/[id]/page.tsx) : pas de discussion sans
  // compte. La conversation réelle est démarrée là-bas (InlineChatPanel) — ici on s'y contente de
  // rediriger avec `?chat=1` pour qu'elle s'ouvre directement, sans dupliquer la logique de
  // messagerie dans la carte.
  function handleChatClick() {
    router.push(isAuthenticated ? `/annonce/${property.id}?chat=1` : '/connexion');
  }

  // "J'aime" appelle un vrai compteur partagé côté backend (voir use-like-property.ts) — contrairement
  // à "Enregistrer" (menu "...", purement local) : sans compte, impossible de savoir à qui
  // attribuer le like, donc même redirection que pour la discussion.
  function handleLikeClick() {
    if (!isAuthenticated || !userId) {
      router.push('/connexion');
      return;
    }
    toggleLike({ id: property.id, wasLiked: isLiked, userId });
  }

  return (
    <article className="bg-surface-card rounded-2xl border border-stroke-default/80 shadow-sm hover:shadow-md transition">
      <Link href={`/annonce/${property.id}`} className="block relative aspect-[3/2] bg-stroke-default rounded-t-2xl overflow-hidden">
        {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
        {property.publisherType && (
          <span className="absolute top-3 left-3 bg-surface-card/95 text-content-main text-[10px] font-bold px-2 py-1 rounded-md uppercase">
            {t.search[PUBLISHER_LABEL_KEY[property.publisherType]]}
          </span>
        )}
        {/* Bande flottante translucide (façon Instagram/Marketplace) plutôt que deux badges blancs
            séparés : regroupe location/vente et prix sans jamais se fondre dans une photo claire.
            `surface-dark` (brun très sombre du thème, pas un noir codé en dur) garde un texte
            blanc lisible sur n'importe quelle photo tout en restant lié à la palette de l'app. */}
        <div className="absolute inset-x-2 bottom-1 flex items-center justify-between gap-2 bg-surface-dark/62 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="text-white text-[10px] font-bold uppercase truncate">
            {property.kind === 'rent' ? t.property.forRent : t.property.forSale}
          </span>
          <span className="text-white text-[15px] font-bold shrink-0">
            {formatPrice(property.price)}
            {getPriceSuffix(property) && <span className="text-xs font-normal text-white/75">{getPriceSuffix(property)}</span>}
          </span>
        </div>
      </Link>

      <div className="px-3 py-2 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          {/* `content-main` (pas `content-muted`) : la localisation reste une information clé de
              l'annonce, pas un simple détail secondaire — demandé explicitement après un retour
              sur sa lisibilité en thème sombre. */}
          <p className="text-xs text-content-main flex items-center gap-1 min-w-0">
            <MapPin size={12} className="shrink-0 text-brand-primary" />
            <span className="truncate">{property.location}</span>
          </p>
          <span className="text-xs text-content-muted shrink-0">{formatRelativeTime(property.createdAt)}</span>
        </div>
        <h3 className="text-sm font-semibold text-content-main line-clamp-1">{property.title}</h3>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-stroke-default">
        {property.authorName ? (
          <Link href={`/profil/${property.ownerId}`} className="flex items-center gap-1.5 min-w-0 hover:underline">
            <Avatar name={property.authorName} imageUrl={property.authorAvatarUrl} size={22} />
            <span className="text-xs font-semibold text-content-main truncate">@{property.authorName}</span>
          </Link>
        ) : (
          <span />
        )}
        {/* Rien pour un admin : il ne "j'aime"/enregistre/contacte pas une annonce, il modère
            (voir /admin) — demandé explicitement. */}
        {!isAdminUser && (
          <div className="flex items-center gap-3 text-xs font-medium text-content-muted shrink-0">
            <button
              type="button"
              onClick={handleLikeClick}
              aria-label={isLiked ? t.property.unlike : t.property.like}
              aria-pressed={isLiked}
              className="flex items-center gap-1 hover:text-danger transition"
            >
              <Heart size={15} className={isLiked ? 'text-danger fill-danger' : ''} />
              {formatCount(property.likesCount)}
            </button>
            <button
              type="button"
              onClick={handleChatClick}
              aria-label={`${t.propertyDetail.chatWith} ${property.authorName ?? ''}`.trim()}
              className="hover:text-brand-primary transition"
            >
              <MessageCircle size={15} />
            </button>
            <CardOptionsMenu property={property} />
          </div>
        )}
      </div>
    </article>
  );
}
