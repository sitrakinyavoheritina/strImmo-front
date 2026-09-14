'use client';

import { useEffect, useRef } from 'react';
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
/** Repos avant de reprendre le défilement automatique après une interaction (drag ou survol) —
 *  assez long pour laisser le temps de lire la carte qu'on vient de regarder/déplacer avant que le
 *  rail ne reparte tout seul. */
const AUTO_SCROLL_RESUME_DELAY = 3000;
/** px/seconde — avance non-stop à cette vitesse constante (comme une voiture), pas par à-coups
 *  espacés dans le temps (comme l'aiguille des secondes d'une montre, qui avance puis s'arrête net
 *  avant le tic suivant) — demandé explicitement après un premier essai à base de `setInterval` +
 *  une animation par "tic". */
const AUTO_SCROLL_SPEED_PX_PER_SEC = 12;

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
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false, targetHref: null as string | null });
  const isAutoScrollPausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Position (px, >= 0) actuellement affichée, que ce soit via `rail.scrollLeft` (interaction
  // manuelle) ou `track.style.transform` (avance auto) — seule "source de vérité" partagée entre
  // les deux modes, pour permuter de l'un à l'autre sans jamais faire sauter visuellement le rail.
  const positionRef = useRef(0);

  function scrollByStep(direction: 1 | -1) {
    pauseAutoScroll();
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
    scheduleAutoScrollResume();
  }

  // Interaction manuelle (drag ou survol desktop) : coupe l'avance automatique tout de suite, puis
  // programme sa reprise après un temps de repos — voir AUTO_SCROLL_RESUME_DELAY. Les deux usages
  // (pointerdown/pointerup et mouseenter/mouseleave) partagent ce même minuteur, remis à zéro à
  // chaque nouvelle interaction. Rebascule aussi du mode "transform" (avance auto) au mode
  // `scrollLeft` natif (glisser/molette/accrochage aux cartes) sur la même position affichée, sans
  // saut visuel — voir le commentaire détaillé sur `positionRef`. `scrollSnapType` coupé ici : sans
  // ça, dès qu'on repasse à `scrollLeft` (une position quelconque, pas forcément alignée sur une
  // carte), le navigateur corrige aussitôt vers la carte la plus proche — parfois la voisine plutôt
  // que celle visée, donnant l'impression que le bien qu'on regardait "disparaît" au survol. Remis
  // en place seulement après un vrai glisser (voir handlePointerUp), où cet alignement est voulu.
  // `wasRunning` : la conversion transform→scrollLeft ne doit avoir lieu QU'UNE FOIS, à l'instant où
  // l'avance auto tournait encore — sinon un second appel pendant que c'est déjà en pause (ex. un
  // second clic sur la flèche avant la reprise auto) réécrase `rail.scrollLeft` avec l'ancien
  // `positionRef` (jamais mis à jour tant qu'on reste en pause) et efface silencieusement tout
  // déplacement manuel fait entre-temps — constaté : un deuxième clic "n'avançait plus".
  function pauseAutoScroll() {
    const wasRunning = !isAutoScrollPausedRef.current;
    isAutoScrollPausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    if (!wasRunning) return;
    const rail = railRef.current;
    const track = trackRef.current;
    if (rail && track) {
      rail.style.scrollSnapType = 'none';
      rail.scrollLeft = positionRef.current;
      track.style.transform = 'translateX(0px)';
    }
  }

  function scheduleAutoScrollResume() {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isAutoScrollPausedRef.current = false;
    }, AUTO_SCROLL_RESUME_DELAY);
  }

  // Avance en continu, image par image (`requestAnimationFrame`), plutôt que par à-coups
  // périodiques (`setInterval` + une animation qui s'arrête entre deux tics) — demandé
  // explicitement. Anime `transform` sur `trackRef` (pas `rail.scrollLeft`) : modifier `scrollLeft`
  // en continu force le navigateur à repeindre le texte et les images à chaque image à un
  // sous-pixel différent, d'où le tremblement constaté visuellement — `transform` est composité par
  // le GPU sans repeindre le contenu. `lastTimeRef` à `null` pendant une pause : au moment de
  // reprendre, la première image resynchronise juste `positionRef` sur `rail.scrollLeft` (au cas où
  // l'utilisateur a glissé le rail entre-temps) et rebascule sur `transform`, sans bouger ni sauter.
  useEffect(() => {
    let rafId: number;
    const lastTimeRef = { current: null as number | null };

    function tick(now: number) {
      const rail = railRef.current;
      const track = trackRef.current;
      if (!rail || !track || isAutoScrollPausedRef.current) {
        lastTimeRef.current = null;
      } else if (lastTimeRef.current === null) {
        positionRef.current = rail.scrollLeft;
        rail.scrollLeft = 0;
        track.style.transform = `translateX(${-Math.round(positionRef.current)}px)`;
        lastTimeRef.current = now;
      } else {
        const maxScroll = track.scrollWidth - rail.clientWidth;
        if (maxScroll > 1) {
          const elapsedSeconds = (now - lastTimeRef.current) / 1000;
          positionRef.current += AUTO_SCROLL_SPEED_PX_PER_SEC * elapsedSeconds;
          if (positionRef.current >= maxScroll) positionRef.current = 0;
          // Arrondi au pixel entier : un `translateX` fractionnaire fait quand même trembler le
          // texte (l'antialiasing des lettres et le lissage des coins arrondis se recalculent à un
          // sous-pixel différent à chaque image) — constaté visuellement même après être passé de
          // `scrollLeft` à `transform`.
          track.style.transform = `translateX(${-Math.round(positionRef.current)}px)`;
        }
        lastTimeRef.current = now;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail) return;
    pauseAutoScroll();
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
    // Réactive l'accrochage aux cartes désormais qu'un vrai glisser est terminé — coupé pendant la
    // pause (voir pauseAutoScroll) pour ne pas faire "sauter" la position vers la carte la plus
    // proche dès la simple mise en pause. `drag.current.moved` : seulement après un vrai glisser,
    // pas un simple clic (sinon la position pourrait sauter juste avant que la navigation ne parte).
    if (drag.current.moved && railRef.current) railRef.current.style.scrollSnapType = '';
    drag.current.isDown = false;
    scheduleAutoScrollResume();
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
        onMouseEnter={pauseAutoScroll}
        onMouseLeave={scheduleAutoScrollResume}
        className="overflow-x-auto scroll-touch snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
      >
        {/* `trackRef` porte l'avance automatique (transform, voir plus haut) ; `railRef` (parent,
            scrollable) porte le défilement natif manuel — les deux se relaient sur la même position
            sans jamais bouger en même temps. */}
        <div ref={trackRef} className="flex gap-2.5 pb-1 w-max will-change-transform">
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
