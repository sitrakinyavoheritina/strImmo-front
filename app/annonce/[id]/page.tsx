'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Copy, Heart, MapPin, MessageCircle, Pencil, Phone, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLikesStore } from '@/lib/state/use-likes-store';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useProperty } from '@/features/search/hooks/use-property';
import { useLikeProperty } from '@/features/search/hooks/use-like-property';
import { useApproveProperty, useRejectProperty } from '@/features/search/hooks/use-moderate-property';
import { useDeleteProperty } from '@/features/search/hooks/use-delete-property';
import { PROPERTY_TYPE_LABEL_KEY } from '@/features/search/utils/get-key-features';
import { getPropertyDetailStats } from '@/features/search/utils/get-property-detail-stats';
import { formatPrice } from '@/features/search/utils/format-price';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';
import { InlineChatPanel } from '@/features/property-detail/components/inline-chat-panel';
import { PropertyMap } from '@/features/property-detail/components/property-map';
import { CardOptionsMenu } from '@/features/feed/components/card-options-menu';

export default function AnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const isLiked = useLikesStore((state) => (userId ? state.likedByUser[userId] : undefined)?.includes(id) ?? false);
  const { mutate: toggleLike } = useLikeProperty();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activePhoto, setActivePhoto] = useState(0);
  const [manualChatOpen, setManualChatOpen] = useState(false);
  const { mutate: approve, isPending: isApproving } = useApproveProperty();
  const { mutate: reject, isPending: isRejecting } = useRejectProperty();
  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [moderationError, setModerationError] = useState<string | null>(null);
  const { mutate: removeProperty, isPending: isDeleting } = useDeleteProperty();
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
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

  // Modération admin (voir aussi PendingPropertyCard, même paire d'actions sur la liste
  // /validation) — ici en plus sur la fiche détail : un admin qui ouvre une annonce depuis cette
  // liste (photo/titre) doit pouvoir valider sans devoir revenir en arrière, ce qui manquait
  // (constaté explicitement : "il ne trouve pas le bouton pour valider"). Retour direct à
  // /validation une fois l'action faite (demandé explicitement) — cette fiche n'a plus rien à y
  // faire pour un admin une fois l'annonce traitée, et ça enchaîne naturellement sur la suivante.
  function handleApprove() {
    setModerationError(null);
    approve(id, {
      onSuccess: () => router.push('/validation'),
      onError: () => setModerationError(t.validationPage.approveError),
    });
  }

  function handleConfirmReject() {
    if (!rejectReason.trim()) {
      setModerationError(t.validationPage.rejectReasonRequired);
      return;
    }
    setModerationError(null);
    reject(
      { id, reason: rejectReason.trim() },
      {
        onSuccess: () => router.push('/validation'),
        onError: () => setModerationError(t.validationPage.rejectError),
      }
    );
  }

  // Supprimer l'annonce depuis la fiche détail — même mutation et mêmes libellés que la carte
  // "Mes Biens" (my-property-card.tsx), confirmation en deux temps identique. Redirige vers
  // /mes-biens une fois supprimée : cette fiche n'a plus rien à afficher.
  function handleConfirmDelete() {
    setDeleteError(false);
    removeProperty(id, {
      onSuccess: () => router.push('/mes-biens'),
      onError: () => {
        setIsDeleteConfirming(false);
        setDeleteError(true);
      },
    });
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

  const isAdminUser = isAdmin(user);
  const canModerate = isAdminUser && property.moderationStatus === 'pending';

  const { stats, amenities } = getPropertyDetailStats(property, t);

  return (
    <div className="flex">
      <div className="flex-1 min-w-0 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col">
      {/* Actions propriétaire (modifier / supprimer) en haut à droite, à côté du retour — demandé
          explicitement plutôt qu'enfouies plus bas dans le panneau d'infos. Absentes pour un
          admin : il modère, il ne gère pas sa propre annonce (voir plus bas). */}
      <div className="shrink-0 flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-semibold text-content-muted hover:text-content-main"
        >
          <ArrowLeft size={16} />
          {t.propertyDetail.back}
        </button>
        {userId === property.ownerId && !isAdminUser && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsDeleteConfirming(true)}
              className="!bg-danger/10 !border-danger/40 !text-danger hover:!bg-danger/20"
            >
              <Trash2 size={14} className="shrink-0" />
              {t.myPropertiesPage.delete}
            </Button>
            <Link href={`/annonce/${id}/modifier`}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="!bg-brand-primary-soft !border-brand-primary/40 !text-brand-primary hover:!bg-brand-primary/20"
              >
                <Pencil size={14} className="shrink-0" />
                {t.listing.editListingTitle}
              </Button>
            </Link>
          </div>
        )}
      </div>

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
                ici faute de ligne dédiée comme dans la carte. Absent pour un admin : il ne
                "j'aime"/enregistre/signale pas une annonce, il modère (voir plus bas). */}
            {!isAdminUser && (
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
            )}
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
              modal, pas d'autre page) — remplit l'espace disponible sous les vignettes. Absent
              pour un admin : il ne discute pas avec le vendeur, il modère (voir plus bas). En
              dessous de lg: le bouton lui-même est remplacé par la barre fixe en bas d'écran
              (Contacter + Discuter, voir plus bas) — seul le panneau de discussion ouvert reste
              ici, sur les deux tailles. */}
          {!isAdminUser && property.authorName &&
            (!isChatOpen ? (
              // `hidden lg:block` sur ce wrapper plutôt que directement sur le Button : le Button
              // porte déjà sa propre classe `inline-flex` de base, qui entre en conflit de
              // spécificité avec un `hidden` posé sur le même élément (constaté explicitement : le
              // bouton restait visible en mobile malgré la classe `hidden`) — un wrapper neutre
              // sans classe d'affichage concurrente évite le problème.
              <div className="hidden lg:block">
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
              </div>
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
            {/* Remonté ici (pas tout en bas, groupé avec "Contacter") : c'est l'info n°1 pour
                décider si on continue à regarder l'annonce, demandé explicitement après un retour
                sur le fait qu'il fallait scroller au-delà des caractéristiques/équipements/
                description avant de le voir. */}
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-xl sm:text-2xl font-bold text-brand-secondary-text">{formatPrice(property.price)}</span>
              {property.propertyType === 'land' && <span className="text-content-muted text-xs sm:text-sm"> / m²</span>}
            </div>

            {/* Motif de refus — visible par le propriétaire sur sa propre fiche, pas seulement
                dans la liste "Mes Biens" (où c'était déjà affiché) : demandé explicitement pour
                qu'il le voie aussi en ouvrant directement l'annonce. Absent pour tout autre
                visiteur (dont un admin, qui a ses propres actions de modération juste en dessous). */}
            {property.moderationStatus === 'rejected' && property.rejectionReason && userId === property.ownerId && (
              <div className="mt-3 bg-danger/10 border border-danger/20 rounded-xl p-3">
                <p className="text-sm font-semibold text-danger">{t.propertyDetail.rejectionNotice}</p>
                <p className="text-sm text-content-main mt-1">
                  <span className="font-semibold">{t.myPropertiesPage.rejectionReasonPrefix}</span> {property.rejectionReason}
                </p>
              </div>
            )}

            {/* Actions de modération (admin/superadmin, annonce encore "pending") — mêmes actions
                que sur la liste /validation, en plus ici pour un admin qui ouvre la fiche depuis
                cette liste (photo/titre) sans avoir à revenir en arrière pour valider. */}
            {canModerate &&
              (isRejectFormOpen ? (
                <div className="mt-3 bg-surface-app border border-stroke-default rounded-xl p-3 space-y-2">
                  <label className="block text-xs font-semibold text-content-muted" htmlFor="reject-reason">
                    {t.validationPage.rejectReasonLabel}
                  </label>
                  <textarea
                    id="reject-reason"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder={t.validationPage.rejectReasonPlaceholder}
                    rows={2}
                    className="w-full rounded-lg border border-stroke-default bg-surface-card px-2.5 py-1.5 text-sm text-content-main placeholder-content-muted outline-none focus:border-brand-primary resize-none"
                  />
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      disabled={isRejecting}
                      className="font-semibold text-danger disabled:opacity-50"
                    >
                      {t.validationPage.rejectConfirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRejectFormOpen(false);
                        setRejectReason('');
                        setModerationError(null);
                      }}
                      className="font-semibold text-content-muted"
                    >
                      {t.validationPage.rejectCancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" onClick={handleApprove} disabled={isApproving} className="flex-1">
                    {t.validationPage.approve}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsRejectFormOpen(true)}
                    className="flex-1 !text-danger !border-danger/30 hover:!bg-danger/10"
                  >
                    {t.validationPage.reject}
                  </Button>
                </div>
              ))}
            {moderationError && <p className="text-xs text-danger mt-1.5">{moderationError}</p>}
          </div>

          {stats.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <h2 className="text-sm font-bold text-content-main mb-1">{t.propertyDetail.detailsTitle}</h2>
              {/* 3 colonnes, icône/valeur/libellé sur une seule ligne (pas empilés) : au plus 3
                  caractéristiques possibles (voir get-property-detail-stats.ts), tiennent donc
                  sur une seule ligne de cartes elles-mêmes réduites à une seule ligne de texte
                  chacune — demandé explicitement pour prendre le moins de place possible. */}
              <div className="grid grid-cols-3 gap-1">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-center gap-1 bg-surface-app lg:bg-surface-card border border-stroke-default rounded-md py-1 px-1"
                  >
                    <stat.icon size={12} className="shrink-0 text-brand-primary" />
                    <span className="text-xs font-bold text-content-main whitespace-nowrap">{stat.value}</span>
                    <span className="text-xs text-content-muted truncate">{stat.label}</span>
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

          {/* Position précise (voir map-position-picker.tsx) + indication complémentaire
              ("repère" — ex. "Lot II B 123, près de..."), enregistrées à la création mais
              jamais affichées ici jusqu'ici — absentes sur une annonce créée avant l'ajout de
              cette fonctionnalité, d'où les deux conditions séparées. */}
          {(property.latitude != null && property.longitude != null) || property.address ? (
            <div className="mt-3">
              <h2 className="text-sm font-bold text-content-main mb-1.5">{t.propertyDetail.locationSectionTitle}</h2>
              {property.latitude != null && property.longitude != null && (
                <PropertyMap latitude={property.latitude} longitude={property.longitude} />
              )}
              {property.address && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-content-main">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-content-muted" />
                  {property.address}
                </p>
              )}
            </div>
          ) : null}

          {/* Toujours visible sans avoir à chercher : collé en bas du panneau (lg:sticky), même
              si stats/équipements/description au-dessus ont besoin de défiler en interne. Le prix
              est remonté sous le titre (voir plus haut) — seul le bouton d'action reste ici. Absent
              pour un admin : il n'appelle pas le vendeur, il modère (voir plus haut). En dessous de
              lg: remplacé par la barre fixe en bas d'écran (voir plus bas). */}
          {!isAdminUser && property.contactPhone && (
            <div className="hidden lg:block lg:sticky lg:bottom-0 lg:bg-surface-card mt-3 pt-3 border-t border-stroke-default">
              <ContactActions
                contactPhone={property.contactPhone}
                phone2={property.phone2}
                isAuthenticated={isAuthenticated}
                requireAuth={requireAuth}
                contactLabel={t.propertyDetail.contact}
                copyLabel={t.propertyDetail.copyNumber}
                copiedLabel={t.propertyDetail.numberCopied}
              />
            </div>
          )}

          {/* Réserve la place occupée par la barre fixe ci-dessous (mobile uniquement) pour que
              la description ne se retrouve pas cachée derrière une fois tout en bas du scroll. */}
          {!isAdminUser && (property.contactPhone || (property.authorName && !isChatOpen)) && (
            <div className="h-32 lg:hidden" />
          )}
        </div>
      </div>
      </div>

      {/* En dessous de lg: : "Contacter" et "Écrire directement à..." (dans cet ordre) fixés en
          bas de l'écran, toujours visibles pendant le scroll — remplace les deux versions
          affichées en flux normal ci-dessus (masquées via `hidden lg:block`). `bottom-16` (pas
          `bottom-0`) : la bande d'icônes mobile (MobileNavStrip, voir app-shell.tsx) occupe déjà
          les 64px du bas avec le même `fixed bottom-0` — sans ce décalage les deux se
          superposaient exactement (constaté explicitement : le second bouton de cette barre
          restait invisible, caché derrière). "Contacter" reste affiché même discussion ouverte —
          seul "Écrire directement à..." disparaît alors (remplacé par le panneau de discussion
          ouvert juste au-dessus, sous la photo) : masquer toute la barre à ce moment-là rendait
          "Contacter" totalement inaccessible pendant qu'on discute (constaté explicitement :
          "le contact disparaît en bas de la page"). Absente pour un admin, comme les deux actions
          qu'elle contient. */}
      {!isAdminUser && (property.contactPhone || (property.authorName && !isChatOpen)) && (
        <div className="lg:hidden fixed inset-x-0 bottom-16 z-40 bg-surface-card border-t border-stroke-default px-3 py-2.5 space-y-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          {property.contactPhone && (
            <ContactActions
              contactPhone={property.contactPhone}
              phone2={property.phone2}
              isAuthenticated={isAuthenticated}
              requireAuth={requireAuth}
              contactLabel={t.propertyDetail.contact}
              copyLabel={t.propertyDetail.copyNumber}
              copiedLabel={t.propertyDetail.numberCopied}
            />
          )}
          {property.authorName && !isChatOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => (isAuthenticated ? setManualChatOpen(true) : requireAuth())}
              className="w-full"
            >
              <MessageCircle size={14} className="shrink-0" />
              <span className="truncate">
                {t.propertyDetail.chatWith} {property.authorName}
              </span>
            </Button>
          )}
        </div>
      )}
      {isDeleteConfirming && (
        <DeleteConfirmModal
          onCancel={() => setIsDeleteConfirming(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
      <RightRail />
    </div>
  );
}

/** Numéro(s) de contact — le principal (celui du compte) plus l'éventuel numéro secondaire propre
 * à cette annonce (voir property-form.tsx), sous un unique titre "Contacter". Chacun sur sa
 * propre ligne, bien séparés — copie le numéro dans le presse-papiers au clic (pas d'appel
 * direct : un clic sur un lien `tel:` ne fait souvent rien d'utile hors d'un vrai téléphone,
 * demandé explicitement après un essai où le clic ne faisait visiblement rien). Factorisé ici
 * pour ne pas dupliquer cette logique entre la version desktop (colonne d'infos) et la barre fixe
 * mobile ci-dessus. */
function ContactActions({
  contactPhone,
  phone2,
  isAuthenticated,
  requireAuth,
  contactLabel,
  copyLabel,
  copiedLabel,
}: {
  contactPhone?: string;
  phone2?: string;
  isAuthenticated: boolean;
  requireAuth: () => void;
  contactLabel: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  async function handleCopy(number: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber((current) => (current === number ? null : current)), 1500);
    } catch {
      // Presse-papiers indisponible (permission refusée, contexte non sécurisé...) — le numéro
      // reste de toute façon affiché en clair, copiable manuellement.
    }
  }

  if (!isAuthenticated) {
    // Les numéros ne sont pas révélés tant qu'on n'est pas connecté — inutile de les mettre dans
    // le DOM pour un utilisateur qui ne peut de toute façon pas encore les utiliser.
    return (
      <Button type="button" size="sm" onClick={requireAuth} className="w-full">
        <Phone size={14} className="shrink-0" />
        <span className="truncate">{contactLabel}</span>
      </Button>
    );
  }

  const numbers = [contactPhone, phone2].filter((value): value is string => Boolean(value));

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-content-muted">{contactLabel}</p>
      {numbers.map((number, index) => {
        const isCopied = copiedNumber === number;
        return (
          <button
            key={number}
            type="button"
            onClick={() => handleCopy(number)}
            aria-label={copyLabel}
            className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
              index === 0
                ? 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/20'
                : 'bg-surface-app hover:bg-stroke-default border border-stroke-default text-content-main'
            }`}
          >
            {isCopied ? <Check size={14} className="shrink-0" /> : <Copy size={14} className="shrink-0" />}
            <span className="truncate">{isCopied ? copiedLabel : number}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Confirmation de suppression en modal (pas de texte inline à côté du bouton, demandé
 * explicitement) — même overlay que filter-modal.tsx (fond assombri/flouté, clic dehors = annule,
 * `stopPropagation` sur le panneau). Boutons/libellés identiques à my-property-card.tsx (même
 * action, même confirmation, ailleurs dans l'app). */
function DeleteConfirmModal({
  onCancel,
  onConfirm,
  isDeleting,
  error,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface-card rounded-2xl shadow-lg p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold text-content-main">{t.myPropertiesPage.deleteConfirm}</p>
        {error && <p className="mt-2 text-xs text-danger">{t.myPropertiesPage.deleteError}</p>}
        <div className="mt-4 flex items-center gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            {t.myPropertiesPage.deleteCancelButton}
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 !bg-danger hover:!bg-danger-hover"
          >
            {t.myPropertiesPage.deleteConfirmButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
