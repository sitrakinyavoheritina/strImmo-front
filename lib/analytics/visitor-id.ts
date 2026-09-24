const VISITOR_ID_KEY = 'onina_visitor_id';
const DIRTY_KEY = 'onina_visitor_dirty';

function newId(): string {
  return crypto.randomUUID();
}

// Identifiant anonyme et aléatoire du navigateur (jamais dérivé d'une donnée personnelle),
// utilisé pour compter les visiteurs uniques et rattacher l'historique à la connexion. Toutes les
// lectures/écritures sont protégées : localStorage peut être indisponible (navigation privée...).
export function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// Renouvelé après un rattachement à un compte : un autre utilisateur du même navigateur repartira
// d'un historique anonyme vierge au lieu d'hériter de celui du précédent.
export function rotateVisitorId(): void {
  try {
    localStorage.setItem(VISITOR_ID_KEY, newId());
  } catch {
    // ignoré
  }
}

// Marque qu'il existe des consultations anonymes à rattacher — évite un appel réseau de
// rattachement à chaque chargement de page pour un utilisateur déjà connecté.
export function markAnonymousActivity(): void {
  try {
    localStorage.setItem(DIRTY_KEY, '1');
  } catch {
    // ignoré
  }
}

export function consumeAnonymousActivityFlag(): boolean {
  try {
    const dirty = localStorage.getItem(DIRTY_KEY) === '1';
    if (dirty) localStorage.removeItem(DIRTY_KEY);
    return dirty;
  } catch {
    return false;
  }
}
