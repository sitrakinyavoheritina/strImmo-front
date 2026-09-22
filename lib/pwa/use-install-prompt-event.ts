'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Type minimal — absent du lib DOM standard de TypeScript (événement propriétaire Chromium, jamais
// normalisé par le W3C, inexistant sur Safari/Firefox).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// À usage unique (imposé par l'API navigateur, voir `consume` plus bas) : un seul événement à la
// fois suffit, pas besoin d'un vrai store multi-abonnés.
let capturedEvent: BeforeInstallPromptEvent | null = null;

function subscribe(callback: () => void) {
  function handleBeforeInstallPrompt(event: Event) {
    // Empêche le mini-menu discret du navigateur : on affiche notre propre bandeau "Installer"
    // (voir InstallPromptBanner) et on ne redéclenche le vrai prompt qu'à ce moment-là.
    event.preventDefault();
    capturedEvent = event as BeforeInstallPromptEvent;
    callback();
  }
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
}

function getSnapshot(): BeforeInstallPromptEvent | null {
  return capturedEvent;
}

function getServerSnapshot(): BeforeInstallPromptEvent | null {
  return null;
}

/** Événement d'installation natif — seulement Chrome/Edge/Android (jamais Safari/iOS, voir
 *  useIsIOS) — capturé dès qu'il arrive pour proposer notre propre bandeau "Installer" plutôt que
 *  le menu discret du navigateur. `consume()` déclenche le vrai prompt natif puis oublie
 *  l'événement (à usage unique, comme l'impose l'API) ; l'appelant décide ensuite quoi faire du
 *  résultat (ici, masquer le bandeau qu'il ait été accepté ou non — voir InstallPromptBanner). */
export function useInstallPromptEvent() {
  const event = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const consume = useCallback(async () => {
    if (!capturedEvent) return;
    const toPrompt = capturedEvent;
    capturedEvent = null;
    await toPrompt.prompt();
    await toPrompt.userChoice;
  }, []);

  return { canInstall: event !== null, consume };
}
