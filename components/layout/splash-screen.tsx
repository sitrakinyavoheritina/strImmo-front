'use client';

import { useEffect, useState } from 'react';
import { useIsStandalone } from '@/lib/pwa/use-is-standalone';

const SEEN_KEY = 'onina_splash_seen';
const VISIBLE_MS = 1300;
const FADE_MS = 400;

/** Écran de démarrage (public/splash.svg) affiché au lancement de l'app installée (PWA) — une fois
 * par session, jamais dans un onglet de navigateur ni à chaque changement de page. Fond de la même
 * couleur que le SVG pour qu'il n'y ait aucune bordure visible quel que soit le format d'écran. */
export function SplashScreen() {
  const isStandalone = useIsStandalone();
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fading'>('hidden');

  useEffect(() => {
    if (!isStandalone) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // sessionStorage indisponible : on l'affiche quand même cette fois.
    }
    const start = setTimeout(() => setPhase('visible'), 0);
    const fade = setTimeout(() => setPhase('fading'), VISIBLE_MS);
    const done = setTimeout(() => setPhase('hidden'), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [isStandalone]);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#F2E7CB] transition-opacity ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique local, aucune optimisation utile */}
      <img src="/splash.svg" alt="" className="h-full w-full object-contain" />
    </div>
  );
}
