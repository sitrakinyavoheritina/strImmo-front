// Drapeau « message de bienvenue à afficher » : posé quand un compte vient d'être créé (voir
// use-register.ts, completer-profil), lu à l'arrivée sur l'accueil (WelcomeModal) et effacé à la
// fermeture de tout le parcours (bienvenue + demandes d'autorisation). Par id de compte et dans
// localStorage : il survit à l'écran de vérification du numéro entre l'inscription et l'accueil,
// sans jamais s'afficher pour un compte déjà ancien.
const KEY = 'onina_welcome_pending';

export function markWelcomePending(userId: string): void {
  try {
    localStorage.setItem(KEY, userId);
  } catch {
    // Stockage indisponible : simplement pas de message de bienvenue.
  }
}

export function isWelcomePending(userId: string | undefined): boolean {
  if (!userId) return false;
  try {
    return localStorage.getItem(KEY) === userId;
  } catch {
    return false;
  }
}

export function clearWelcomePending(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Sans conséquence.
  }
}
