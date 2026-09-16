'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { useGoogleAuth } from '../hooks/use-google-auth';
import { FormErrorBanner } from '@/components/ui/form-error-banner';

// Typage minimal du sous-ensemble de l'API Google Identity Services utilisé ici — pas de
// @types/google.accounts publié officiellement, un bouton "Se connecter avec Google" n'a besoin
// que de ces deux appels (voir developers.google.com/identity/gsi/web/reference/js-reference).
type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: { credential: string }) => void;
};
type GoogleButtonOptions = {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  locale?: string;
};
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

// Un seul bouton pour connexion ET création de compte : le backend connecte le compte existant
// si l'email Google correspond déjà à un compte, sinon en crée un nouveau (voir
// strImmo/src/auth/auth.service.ts:loginWithGoogle) — même logique que le bouton natif Google
// partout ailleurs sur le web. `next/script` (pas de nouvelle dépendance npm) charge le script
// Google Identity Services une seule fois, `afterInteractive` : pas bloquant pour le rendu de la
// page de connexion elle-même.
export function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const { loginWithIdToken, isLoading, errorMessage } = useGoogleAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!isScriptReady || !clientId || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        void loginWithIdToken(response.credential);
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 320,
    });
    // `loginWithIdToken` change de référence à chaque rendu (nouvelle closure de useGoogleAuth) —
    // le réinclure redéclencherait `renderButton` en boucle sans raison, le callback capturé lors
    // de `initialize` reste valide (il n'appelle que `loginWithIdToken`, jamais un état figé).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptReady, clientId]);

  if (!clientId) return null;

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(true)}
      />
      {errorMessage && (
        <div className="mb-2">
          <FormErrorBanner message={errorMessage} />
        </div>
      )}
      <div className={`flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`} ref={buttonRef} />
    </div>
  );
}
