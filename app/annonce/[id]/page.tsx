'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Ruler,
  BedDouble,
  Home,
  Car,
  Bike,
  Droplet,
  Bath,
  Zap,
  Sofa,
  Sparkles,
  Building2,
  Landmark,
  CheckCircle2,
  MessageCircle,
  Phone,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLikesStore } from '@/lib/state/use-likes-store';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useProperty } from '@/features/search/hooks/use-property';
import { useLikeProperty } from '@/features/search/hooks/use-like-property';
import { PROPERTY_TYPE_LABEL_KEY } from '@/features/search/utils/get-key-features';
import { formatPrice } from '@/features/search/utils/format-price';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';
import { InlineChatPanel } from '@/features/property-detail/components/inline-chat-panel';
import { CardOptionsMenu } from '@/features/feed/components/card-options-menu';

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

interface Amenity {
  icon: LucideIcon;
  text: string;
}

const WATER_SOURCE_LABEL_KEY = { jirama: 'jirama', well: 'well', other: 'other' } as const;
const LEGAL_STATUS_LABEL_KEY = {
  titled: 'legalStatusTitled',
  cadastre: 'legalStatusCadastre',
  fitanolorana: 'legalStatusFitanolorana',
  other: 'other',
} as const;

export default function AnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const isLiked = useLikesStore((state) => (userId ? state.likedByUser[userId] : undefined)?.includes(id) ?? false);
  const { mutate: toggleLike } = useLikeProperty();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activePhoto, setActivePhoto] = useState(0);
  const [manualChatOpen, setManualChatOpen] = useState(false);
  // Arrivée depuis le bouton "message" d'une carte du fil (?chat=1, voir feed-property-card.tsx) :
  // ouvre directement la discussion plutôt que de forcer un second clic sur "Discuter". Dérivé du
  // rendu (pas un state+effect) pour rester correct si la session finit de se réhydrater après le
  // premier rendu.
  const isChatOpen = manualChatOpen || (searchParams.get('chat') === '1' && isAuthenticated);

  const { data: property, isLoading } = useProperty(id);

  // Contacter le vendeur, discuter avec lui, publier une annonce : tout ça suppose un compte
  // (on ne peut ni afficher un numéro à contacter, ni ouvrir une discussion, sans savoir qui la
  // mène) — on envoie directement vers la connexion plutôt que de laisser cliquer dans le vide.
  function requireAuth() {
    router.push('/connexion');
  }

  // Même règle que sur la carte du fil (voir feed-property-card.tsx) : "j'aime" est un compteur
  // partagé côté backend, impossible à attribuer sans compte.
  function handleLikeClick() {
    if (!isAuthenticated || !userId) {
      requireAuth();
      return;
    }
    toggleLike({ id, wasLiked: isLiked, userId });
  }

  // Retire aussi `?chat=1` de l'URL : sinon la discussion rouvrirait aussitôt au prochain rendu.
  function closeChat() {
    setManualChatOpen(false);
    if (searchParams.get('chat') === '1') router.replace(`/annonce/${id}`);
  }

  if (isLoading) {
    return (
      <div className="flex">
        <div className="flex-1 min-w-0 max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        </div>
        <RightRail />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex">
        <div className="flex-1 min-w-0 max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-lg font-bold text-content-main">{t.propertyDetail.notFoundTitle}</h1>
          <p className="text-sm text-content-muted mt-2">{t.propertyDetail.notFoundDesc}</p>
          <Link href="/" className="inline-block mt-4">
            <Button size="sm">{t.propertyDetail.backHome}</Button>
          </Link>
        </div>
        <RightRail />
      </div>
    );
  }

  const stats: Stat[] = [];
  const amenities: Amenity[] = [];

  if (property.propertyType === 'house') {
    stats.push({ icon: BedDouble, value: String(property.bedrooms), label: t.propertyDetail.bedroomsLabel });
    if (property.hasCarAccess) amenities.push({ icon: Car, text: t.search.carAccess });
    if (property.hasMotorbikeAccess) amenities.push({ icon: Bike, text: t.search.hasMotorbikeAccess });
    amenities.push({ icon: Droplet, text: t.search[WATER_SOURCE_LABEL_KEY[property.waterSource]] });
    amenities.push({ icon: Bath, text: property.bathroomLocation === 'interior' ? t.search.interior : t.search.exterior });
    if (property.hasIndividualMeter) amenities.push({ icon: Zap, text: t.search.hasIndividualMeter });
  } else if (property.propertyType === 'villa' || property.propertyType === 'apartment') {
    stats.push({ icon: Ruler, value: `${property.surfaceM2} m²`, label: t.propertyDetail.areaLabel });
    stats.push({ icon: Home, value: property.roomType.replace('plus', '+'), label: t.search.roomTypeLabel });
    if (property.parkingSpots > 0) {
      stats.push({ icon: Car, value: String(property.parkingSpots), label: t.search.parkingSpots });
    }
    if (property.isIndependent) {
      amenities.push({
        icon: Home,
        text: property.propertyType === 'villa' ? t.search.villaIndependent : t.search.apartmentIndependent,
      });
    }
    if (property.isFurnished) amenities.push({ icon: Sofa, text: t.search.isFurnished });
    if (property.hasComfort) amenities.push({ icon: Sparkles, text: t.search.comfort });
    if (property.hasCaretakerAnnex) amenities.push({ icon: Building2, text: t.search.hasCaretakerAnnex });
  } else {
    amenities.push({ icon: Landmark, text: t.search[LEGAL_STATUS_LABEL_KEY[property.legalStatus]] });
    if (property.hasCarAccess) amenities.push({ icon: Car, text: t.search.carAccess });
    if (property.isResidentialArea) amenities.push({ icon: Home, text: t.search.isResidentialArea });
    if (property.hasWaterAvailable) amenities.push({ icon: Droplet, text: t.search.hasWaterAvailable });
    if (property.hasElectricityAvailable) amenities.push({ icon: Zap, text: t.search.hasElectricityAvailable });
    if (property.isBuildReady) amenities.push({ icon: CheckCircle2, text: t.search.isBuildReady });
  }

  return (
    <div className="flex">
      <div className="flex-1 min-w-0 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col">
      <button
        type="button"
        onClick={() => router.back()}
        className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-content-muted hover:text-content-main mb-2 sm:mb-3"
      >
        <ArrowLeft size={16} />
        {t.propertyDetail.back}
      </button>

      {/* À partir de lg:, photo et panneau d'infos se partagent toute la hauteur d'écran
          restante — plus besoin de scroller la page pour tout voir. Le prix/contact reste collé
          en bas du panneau (lg:sticky) : si le panneau lui-même est trop juste sur un écran plus
          étroit, seul son contenu défile en interne (jamais la page entière), et le prix reste
          toujours visible sans avoir à chercher. En dessous de lg:, page classique qui défile
          normalement (impossible de faire tenir tout ça sur un écran de mobile sans dégrader le
          contenu). */}
      <div className="lg:flex-1 lg:min-h-0 lg:bg-surface-card lg:border lg:border-stroke-default lg:rounded-2xl lg:p-5 lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-6">
        {/* Colonne photo — ratio paysage standard (4:3 puis 16:9) gardé à toutes les tailles,
            y compris lg: : le laisser s'étirer à la hauteur disponible de la colonne (comme
            avant) produisait une photo plus haute que large, ce qui n'a pas de sens pour une
            photo de bien immobilier. Alignée en haut (pas centrée) pour démarrer à la même
            hauteur que le titre, dans la colonne d'infos juste à côté. */}
        <div className="lg:h-full lg:flex lg:flex-col lg:min-h-0">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-stroke-default">
            {property.photoUrls[activePhoto] && (
              <Image
                src={property.photoUrls[activePhoto]}
                alt={property.title}
                fill
                priority
                className="object-cover"
              />
            )}
            <span
              className={`absolute top-2 left-2 sm:top-3 sm:left-3 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase ${
                property.kind === 'rent' ? 'bg-brand-primary' : 'bg-brand-secondary'
              }`}
            >
              {property.kind === 'rent' ? t.property.forRent : t.property.forSale}
            </span>
            {/* Cœur ("j'aime", compteur partagé) + menu "..." (enregistrer/signaler, voir
                CardOptionsMenu) — mêmes actions que sur la carte du fil, en overlay sur la photo
                ici faute de ligne dédiée comme dans la carte. */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleLikeClick}
                aria-label={isLiked ? t.property.unlike : t.property.like}
                aria-pressed={isLiked}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-card/90 flex items-center justify-center shadow-sm active:scale-95 transition"
              >
                <Heart size={18} className={isLiked ? 'text-danger fill-danger' : 'text-content-muted'} />
              </button>
              <CardOptionsMenu
                property={property}
                triggerClassName="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-card/90 flex items-center justify-center shadow-sm active:scale-95 transition text-content-muted"
              />
            </div>
          </div>

          {property.photoUrls.length > 1 && (
            <div className="shrink-0 flex gap-2 mt-2 overflow-x-auto scroll-touch">
              {property.photoUrls.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  aria-label={t.propertyDetail.viewPhoto}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    activePhoto === i ? 'border-brand-primary' : 'border-transparent'
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Discuter : bouton juste sous la photo, ouvre la discussion directement ici (pas de
              modal, pas d'autre page) — remplit l'espace disponible sous les vignettes. */}
          {property.authorName &&
            (!isChatOpen ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => (isAuthenticated ? setManualChatOpen(true) : requireAuth())}
                className="shrink-0 mt-2 w-full"
              >
                <MessageCircle size={14} className="shrink-0" />
                <span className="truncate">
                  {t.propertyDetail.chatWith} {property.authorName}
                </span>
              </Button>
            ) : (
              <InlineChatPanel
                propertyId={property.id}
                authorName={property.authorName}
                authorAvatarUrl={property.authorAvatarUrl}
                onClose={closeChat}
              />
            ))}
        </div>

        {/* Panneau d'infos : défilement interne de secours (lg:overflow-y-auto) si le contenu ne
            tient vraiment pas — jamais la page entière. */}
        <div className="mt-3 lg:mt-0 lg:h-full lg:overflow-y-auto lg:pr-1">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-brand-primary uppercase">
              {t.search[PROPERTY_TYPE_LABEL_KEY[property.propertyType]]}
            </span>
            <h1 className="text-lg sm:text-2xl font-bold text-content-main mt-0.5">{property.title}</h1>
            <p className="text-content-muted text-xs sm:text-sm mt-1 flex items-center gap-1">
              <MapPin size={14} />
              {property.location}
            </p>
          </div>

          {stats.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <h2 className="text-sm font-bold text-content-main mb-2">{t.propertyDetail.detailsTitle}</h2>
              <div className="grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-surface-app lg:bg-surface-card border border-stroke-default rounded-xl p-2.5 text-center"
                  >
                    <stat.icon size={18} className="mx-auto text-brand-primary" />
                    <div className="text-sm font-bold text-content-main mt-0.5">{stat.value}</div>
                    <div className="text-[10px] text-content-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {amenities.map((amenity) => (
                <span
                  key={amenity.text}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                >
                  <amenity.icon size={13} />
                  {amenity.text}
                </span>
              ))}
            </div>
          )}

          {property.description && (
            <div className="mt-3">
              <h2 className="text-sm font-bold text-content-main mb-1.5">{t.propertyDetail.descriptionTitle}</h2>
              <p className="text-sm text-content-main leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Toujours visible sans avoir à chercher : collé en bas du panneau (lg:sticky), même
              si stats/équipements/description au-dessus ont besoin de défiler en interne. */}
          <div className="lg:sticky lg:bottom-0 lg:bg-surface-card mt-3 pt-3 border-t border-stroke-default flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-brand-secondary-text">{formatPrice(property.price)}</span>
              {property.propertyType === 'land' && <span className="text-content-muted text-xs sm:text-sm"> / m²</span>}
            </div>
            {property.contactPhone &&
              (isAuthenticated ? (
                <a href={`tel:${property.contactPhone}`} className="min-w-0 sm:w-auto lg:w-full">
                  <Button size="sm" className="w-full">
                    <Phone size={14} className="shrink-0" />
                    <span className="truncate">
                      {t.propertyDetail.contact} — {property.contactPhone}
                    </span>
                  </Button>
                </a>
              ) : (
                // Le numéro n'est pas révélé tant qu'on n'est pas connecté — inutile de le
                // mettre dans le DOM pour un utilisateur qui ne peut de toute façon pas encore
                // l'utiliser.
                <Button
                  type="button"
                  size="sm"
                  onClick={requireAuth}
                  className="min-w-0 sm:w-auto lg:w-full"
                >
                  <Phone size={14} className="shrink-0" />
                  <span className="truncate">{t.propertyDetail.contact}</span>
                </Button>
              ))}
          </div>
        </div>
      </div>
      </div>
      <RightRail />
    </div>
  );
}
