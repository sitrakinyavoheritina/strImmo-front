import { Home, Map, Building2, MessageCircle, Menu, type LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: keyof Translations['sidebar'];
}

/**
 * Source unique des 5 entrées de navigation, partagée par la sidebar
 * desktop et la bande d'icônes mobile — les deux restent toujours en phase.
 *
 * Ordre aligné sur celui de l'app mobile de référence (Onina-mobile/src/navigation/tabs.config.ts :
 * Accueil, Actualités, Messages, Notifications, Menu) — Messages y est le 2ᵉ onglet le plus
 * prioritaire juste après Accueil. Pas de "Favoris" en onglet de premier niveau non plus côté
 * mobile (favoris y vit sous profil, voir Onina-mobile/src/app/profile/favorites.tsx) : remplacé
 * ici par "Menu" (même icône que le "Menu" mobile), qui mène vers /parametres (pas /profil
 * directement, demandé explicitement) — le hub réglages (modifier le profil, langue, mes annonces,
 * mode sombre...) qui renvoie lui-même vers /profil pour voir la fiche complète du compte. C'est
 * aussi le seul point d'entrée visible vers le profil sur mobile web (voir topbar.tsx, dont les
 * liens connexion/profil sont masqués en dessous de `sm:`). */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: Home, labelKey: 'home' },
  { href: '/messages', icon: MessageCircle, labelKey: 'messages' },
  { href: '/cartes', icon: Map, labelKey: 'maps' },
  { href: '/mes-biens', icon: Building2, labelKey: 'myProperties' },
  { href: '/parametres', icon: Menu, labelKey: 'menu' },
];

// Une conversation ouverte vit sous /messages/[id] : un simple `pathname === href` ne
// surlignerait "Messages" que sur la liste elle-même, jamais une fois un fil ouvert. `/` reste un
// cas à part (sinon `startsWith('/')` matcherait toutes les routes).
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
