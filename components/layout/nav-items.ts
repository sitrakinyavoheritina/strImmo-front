import {
  Home,
  Map,
  Building2,
  MessageCircle,
  Menu,
  LayoutDashboard,
  ShieldCheck,
  List,
  type LucideIcon,
} from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: keyof Translations['sidebar'];
}

/**
 * Source unique des entrées de navigation, partagée par la sidebar desktop et la bande d'icônes
 * mobile — les deux restent toujours en phase.
 *
 * Ordre (compte normal) aligné sur celui de l'app mobile de référence
 * (Onina-mobile/src/navigation/tabs.config.ts : Accueil, Actualités, Messages, Notifications,
 * Menu) — Messages y est le 2ᵉ onglet le plus prioritaire juste après Accueil. Pas de "Favoris" en
 * onglet de premier niveau non plus côté mobile (favoris y vit sous profil, voir
 * Onina-mobile/src/app/profile/favorites.tsx) : remplacé ici par "Menu" (même icône que le "Menu"
 * mobile), qui mène vers /parametres (pas /profil directement, demandé explicitement) — le hub
 * réglages (modifier le profil, langue, mes annonces, mode sombre...) qui renvoie lui-même vers
 * /profil pour voir la fiche complète du compte. C'est aussi le seul point d'entrée visible vers
 * le profil sur mobile web (voir topbar.tsx, dont les liens connexion/profil sont masqués en
 * dessous de `sm:`).
 *
 * Compte admin/superadmin : navigation entièrement différente, pas juste une entrée remplacée —
 * un admin ne parcourt pas le fil, ne discute pas, ne consulte pas la carte (rien de tout ça n'a
 * de sens pour lui, voir aussi RightRail masqué pour ces comptes), demandé explicitement
 * ("nouvelle page, nouveau contenu, sans accueil/message/carte"). Remplacé par les trois écrans
 * d'administration (tableau de bord, annonces en attente, toutes les annonces) + "Menu" (réglages
 * du compte, inchangé). */
export function getNavItems(isAdminUser: boolean): NavItem[] {
  if (isAdminUser) {
    return [
      { href: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/validation', icon: ShieldCheck, labelKey: 'validation' },
      { href: '/admin/annonces', icon: List, labelKey: 'annonces' },
      { href: '/parametres', icon: Menu, labelKey: 'menu' },
    ];
  }
  return [
    { href: '/', icon: Home, labelKey: 'home' },
    { href: '/messages', icon: MessageCircle, labelKey: 'messages' },
    { href: '/cartes', icon: Map, labelKey: 'maps' },
    { href: '/mes-biens', icon: Building2, labelKey: 'myProperties' },
    { href: '/parametres', icon: Menu, labelKey: 'menu' },
  ];
}

// Une conversation ouverte vit sous /messages/[id] : un simple `pathname === href` ne
// surlignerait "Messages" que sur la liste elle-même, jamais une fois un fil ouvert. `/` reste un
// cas à part (sinon `startsWith('/')` matcherait toutes les routes).
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
