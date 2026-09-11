import { Home, Map, Heart, Building2, MessageCircle, type LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: keyof Translations['sidebar'];
}

/**
 * Source unique des 5 entrées de navigation, partagée par la sidebar
 * desktop et la bande d'icônes mobile — les deux restent toujours en phase.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: Home, labelKey: 'home' },
  { href: '/cartes', icon: Map, labelKey: 'maps' },
  { href: '/favoris', icon: Heart, labelKey: 'favorites' },
  { href: '/mes-biens', icon: Building2, labelKey: 'myProperties' },
  { href: '/messages', icon: MessageCircle, labelKey: 'messages' },
];

// Une conversation ouverte vit sous /messages/[id] : un simple `pathname === href` ne
// surlignerait "Messages" que sur la liste elle-même, jamais une fois un fil ouvert. `/` reste un
// cas à part (sinon `startsWith('/')` matcherait toutes les routes).
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
