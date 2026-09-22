'use client';

import { Download, Share, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useDismissedInstallPrompt } from '@/lib/pwa/use-dismissed-install-prompt';
import { useInstallPromptEvent } from '@/lib/pwa/use-install-prompt-event';
import { useIsIOS } from '@/lib/pwa/use-is-ios';
import { useIsStandalone } from '@/lib/pwa/use-is-standalone';

// Bandeau global (monté une fois dans AppShell, comme OfflineBanner) proposant d'installer l'app —
// central pour Onina, qui n'a pas d'app iOS native : sur iPhone/iPad, ce PWA EST l'app (voir la
// stratégie produit — Android a Onina-mobile en plus). Deux cas, jamais les deux à la fois :
// - iOS/Safari : pas de `beforeinstallprompt` sur cette plateforme, seulement des instructions
//   (Partager → "Sur l'écran d'accueil"), aucun bouton ne peut déclencher l'installation lui-même.
// - Chrome/Edge/Android : bouton "Installer" qui déclenche le vrai prompt natif du navigateur.
// Rien n'est affiché si le site tourne déjà en app installée (useIsStandalone), si l'événement
// natif n'est pas (encore) arrivé sur une plateforme qui n'est pas iOS (ex. Firefox, qui ne le
// supporte pas — pas de bandeau plutôt qu'un bouton qui ne ferait rien), ou une fois écarté.
export function InstallPromptBanner() {
  const { t } = useTranslation();
  const isStandalone = useIsStandalone();
  const isIOS = useIsIOS();
  const { canInstall, consume } = useInstallPromptEvent();
  const { dismissed, dismiss } = useDismissedInstallPrompt();

  if (isStandalone || dismissed || !(isIOS || canInstall)) return null;

  async function handleInstallClick() {
    await consume();
    // Que l'invite native ait été acceptée ou refusée, elle ne se redéclenche pas dans l'immédiat
    // (limite du navigateur) — inutile de laisser le bandeau affiché pour un bouton devenu inerte.
    dismiss();
  }

  return (
    <div className="flex items-center gap-3 bg-brand-primary-soft text-content-main text-sm py-2 px-3">
      <span className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center text-brand-primary">
        {isIOS ? <Share size={15} /> : <Download size={15} />}
      </span>
      {/* Titre tronqué sur une ligne (secondaire, redondant avec l'icône) — pas la description :
          sur iOS elle porte l'instruction elle-même, la tronquer la rendrait illisible. */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{t.pwa.installTitle}</p>
        <p className="text-xs text-content-muted">
          {isIOS ? t.pwa.installIOSInstructions : t.pwa.installDescription}
        </p>
      </div>
      {!isIOS && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 py-1.5 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition"
        >
          {t.pwa.installButton}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.pwa.installDismiss}
        title={t.pwa.installDismiss}
        className="shrink-0 text-content-muted hover:text-content-main transition p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
