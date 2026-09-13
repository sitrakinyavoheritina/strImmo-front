'use client';

import Link from 'next/link';
import { Bell, Plus, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useUnreadNotificationsCount } from '@/features/notifications/hooks/use-notifications';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Avatar } from '@/components/ui/avatar';
import { UserMenu } from './user-menu';

export function Topbar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const unreadNotifications = useUnreadNotificationsCount();

  return (
    <header
      className="sticky top-0 z-50 bg-surface-card/95 backdrop-blur border-b border-stroke-default"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="w-full px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-3 sm:gap-3.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo décoratif (SVG statique dans /public), pas besoin de l'optimiseur next/image */}
          <img src="/logo.svg" alt="Onina" className="h-8 sm:h-10 w-auto" />
          <span className="font-extrabold tracking-tight">
            <span className="text-lg sm:text-xl text-brand-secondary-text">Onina</span>
            <span className="text-sm sm:text-base text-brand-primary">.mg</span>
          </span>
        </Link>

        <div className="flex-1" />

        {/* Pas de lien "Messages" ici : déjà accessible via la sidebar (desktop) et la bande de
            navigation mobile (voir nav-items.ts) — le dupliquer dans la topbar créait deux icônes
            "Messages" visibles en même temps sur la plupart des largeurs d'écran. */}
        <nav className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href="/notifications"
            aria-label={t.topbar.notifications}
            className="relative flex items-center text-content-muted hover:text-brand-primary transition"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </nav>

        {/* Terracotta (brand-primary), pas le brun du mot-clé "Onina" (brand-secondary) : deux
            couleurs déjà de la charte, pas une nouvelle — pour que le bouton d'action se distingue
            du logo/wordmark plutôt que de se fondre dans le même ton (retour UI/UX explicite). */}
        <Link
          href="/annonce/nouvelle"
          className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover text-sm font-semibold rounded-xl py-2 transition shrink-0"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white shrink-0">
            <Plus size={20} strokeWidth={2.5} />
          </span>
          <span className="sm:hidden">{t.topbar.add}</span>
          <span className="hidden lg:inline">{t.topbar.postAd}</span>
        </Link>

        {/* Masqué sur mobile (en dessous de `lg:`) — demandé explicitement pour désencombrer la
            topbar mobile. */}
        <div className="hidden lg:block shrink-0">
          <LanguageSwitcher />
        </div>

        {/* Remplace la sélection de langue à cet emplacement sur mobile : seul accès au profil
            visible dans la topbar en dessous de `sm:` (UserMenu et les liens connexion/inscription
            juste en dessous sont tous les deux réservés au desktop) — demandé explicitement. Lien
            direct plutôt qu'un menu déroulant (comme UserMenu) : /profil affiche déjà lui-même
            l'invite de connexion si besoin, pas la peine de dupliquer cette logique ici. */}
        <Link href="/profil" aria-label={t.profile.myAccount} className="sm:hidden shrink-0">
          {isAuthenticated && user ? (
            <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={30} />
          ) : (
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-app border border-stroke-default text-content-muted">
              <User size={16} />
            </span>
          )}
        </Link>

        {isAuthenticated && user ? (
          <UserMenu user={user} />
        ) : (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Link href="/connexion" className="text-sm font-semibold text-content-muted hover:text-brand-primary transition">
              {t.nav.login}
            </Link>
            <Link href="/inscription">
              <span className="inline-flex items-center bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl px-3.5 py-2 transition">
                {t.nav.register}
              </span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
