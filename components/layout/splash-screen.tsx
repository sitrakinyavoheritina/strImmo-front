'use client';

import { useEffect, useState } from 'react';
import { useIsStandalone } from '@/lib/pwa/use-is-standalone';
import { SITE_TAGLINE } from '@/lib/seo/site';
import { OninaLogoReveal } from '@/components/ui/onina-logo-reveal';

const SEEN_KEY = 'onina_splash_seen';
// Le reveal du logo (voir OninaLogoReveal / @keyframes onina-logo-* dans globals.css) dure
// ~2,3s à lui seul (tracé progressif → zoom → reflet) ; VISIBLE_MS laisse un court instant
// "posé" après coup avant d'entamer le fondu de sortie.
const VISIBLE_MS = 2800;
const FADE_MS = 400;
// Doit rester identique à `background_color` dans app/manifest.ts (et --color-surface-app en
// clair) : c'est ce fond-là que l'OS affiche pendant sa propre "splash screen" générée du manifest
// juste avant que cet écran ne prenne le relais — un fond différent (l'ancien public/splash.svg
// avait le sien, légèrement décalé, #F2E7CB) créait un flash visible entre les deux.
const BACKGROUND = '#f3e8d2';

/** Écran de démarrage affiché au lancement de l'app installée (PWA), juste après celui que l'OS
 * génère lui-même à partir du manifest (icône + nom sur `background_color`) — une fois par
 * session, jamais dans un onglet de navigateur ni à chaque changement de page. Même logo
 * (public/logo.svg) et même fond que ce premier écran pour enchaîner les deux sans rupture
 * visible, avec le slogan de la marque en plus, dévoilé juste après le logo. */
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 transition-opacity ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: BACKGROUND, transitionDuration: `${FADE_MS}ms` }}
    >
      <OninaLogoReveal className="w-36 sm:w-44" />
      <p className="splash-tagline text-[13px] sm:text-sm font-semibold tracking-wide text-brand-secondary-text">
        {SITE_TAGLINE}
      </p>
    </div>
  );
}
