'use client';

import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatPrice } from '@/features/search/utils/format-price';
import type { Property } from '@/features/search/types/listing.types';

const SCROLL_STEP = 280;
/** En-dessous de ce déplacement (px), un pointerdown/up est traité comme un clic, pas un drag. */
const DRAG_THRESHOLD = 4;

/**
 * Bande horizontale défilable de mini-cartes propriété (photo + badge
 * location/vente + prix + titre + emplacement + chambres/surface) pour
 * parcourir rapidement les annonces en vedette, au-dessus du fil principal —
 * repris du PropertyCard de l'app mobile (largeur réduite pour en voir
 * plusieurs à l'écran lors du scroll). Défilement tactile natif sur mobile ;
 * glisser-déposer à la souris + flèches au survol sur desktop, où il n'y a
 * pas de swipe natif.
 */
export function FeaturedStories({ properties }: { properties: Property[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false, targetHref: null as string | null });

  function scrollByStep(direction: 1 | -1) {
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail) return;
    // `rail.setPointerCapture` retargete tous les événements pointer/souris suivants — y compris
    // "click" — vers `rail` lui-même plutôt que vers le lien effectivement sous le doigt/curseur
    // (comportement du Pointer Capture, pas un bug React) : sans mémoriser sa cible ici, avant
    // capture, le clic sur une carte n'ouvre jamais l'annonce, même sans le moindre glissement.
    const anchor = (e.target as HTMLElement).closest('a');
    drag.current = {
      isDown: true,
      startX: e.clientX,
      startScrollLeft: rail.scrollLeft,
      moved: false,
      targetHref: anchor?.getAttribute('href') ?? null,
    };
    rail.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail || !drag.current.isDown) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) drag.current.moved = true;
    rail.scrollLeft = drag.current.startScrollLeft - delta;
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    railRef.current?.releasePointerCapture(e.pointerId);
    drag.current.isDown = false;
  }

  // La navigation native du lien ne se déclenche jamais (voir commentaire de handlePointerDown) —
  // c'est donc ici, sur le "click" retargeté vers `rail`, qu'on déclenche la navigation nous-mêmes
  // (sauf si le pointerdown/up faisait en fait glisser le rail).
  function handleClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const { moved, targetHref } = drag.current;
    drag.current.moved = false;
    if (!moved && targetHref) router.push(targetHref);
  }

  return (
    <section className="group/rail relative">
      <div
        ref={railRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex gap-2.5 overflow-x-auto scroll-touch snap-x snap-mandatory pb-1 cursor-grab active:cursor-grabbing select-none"
      >
        {properties.map((property) => {
          const cover = property.mainPhotoUrl;
          // Maison : nombre de chambres. Villa/Appartement : surface. Terrain : rien de tel
          // (aucun champ numérique équivalent côté backend) — ligne simplement omise.
          const spec =
            property.propertyType === 'house'
              ? `${property.bedrooms} ${t.property.bedrooms}`
              : property.propertyType === 'villa' || property.propertyType === 'apartment'
                ? `${property.surfaceM2}m²`
                : null;
          return (
            <Link
              key={property.id}
              href={`/annonce/${property.id}`}
              className="w-32 shrink-0 snap-start bg-surface-card rounded-xl border border-stroke-default/80 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-full h-20 bg-stroke-default">
                {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
                <span
                  className={`absolute top-1 left-1 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    property.kind === 'rent' ? 'bg-brand-primary' : 'bg-brand-secondary'
                  }`}
                >
                  {property.kind === 'rent' ? t.property.forRent : t.property.forSale}
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                <p className="text-xs font-bold text-brand-primary line-clamp-1">{formatPrice(property.price)}</p>
                <p className="text-[11px] font-semibold text-content-main line-clamp-1">{property.title}</p>
                <p className="flex items-center gap-0.5 text-[10px] text-content-muted">
                  <MapPin size={9} className="shrink-0" />
                  <span className="truncate">{property.location}</span>
                </p>
                {spec && (
                  <p className="text-[9px] text-content-muted border-t border-stroke-default pt-0.5 line-clamp-1">
                    {spec}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollByStep(-1)}
        aria-label="Précédent"
        className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-surface-card border border-stroke-default shadow-md text-content-main opacity-0 group-hover/rail:opacity-100 transition"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => scrollByStep(1)}
        aria-label="Suivant"
        className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-surface-card border border-stroke-default shadow-md text-content-main opacity-0 group-hover/rail:opacity-100 transition"
      >
        <ChevronRight size={16} />
      </button>
    </section>
  );
}
