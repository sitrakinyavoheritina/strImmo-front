import { useEffect, useState } from 'react';

const RESEND_DELAY_MS = 2 * 60 * 1000;

/** Le bouton "Renvoyer le code" reste caché pendant 2 minutes après l'apparition de l'écran OTP
 *  (ou après un renvoi, voir `reset`) — demandé explicitement, pour laisser le temps au SMS
 *  d'arriver avant de proposer d'en redemander un. `active` : le compte à rebours ne démarre que
 *  pendant que l'écran du code est réellement affiché — certains écrans (BecomePublisherPanel,
 *  VerifyPhonePanel) ne le montrent qu'après l'envoi initial, pas dès le montage du composant. */
export function useResendCountdown(active: boolean) {
  const [canResend, setCanResend] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  // Remet `canResend` à `false` dès qu'un nouveau cycle démarre (changement de `active`/`resetKey`)
  // — ajusté PENDANT le rendu plutôt que dans un effet (pattern recommandé par React pour dériver
  // un état à partir d'une prop qui change), pas besoin d'un aller-retour de rendu en plus.
  const [cycle, setCycle] = useState<[boolean, number]>([active, resetKey]);
  if (cycle[0] !== active || cycle[1] !== resetKey) {
    setCycle([active, resetKey]);
    setCanResend(false);
  }

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setCanResend(true), RESEND_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [active, resetKey]);

  // Relance le délai de 2 minutes — à appeler après un renvoi effectif (le code vient de repartir,
  // inutile de pouvoir en redemander un autre tout de suite).
  function reset() {
    setResetKey((key) => key + 1);
  }

  return { canResend, reset };
}
