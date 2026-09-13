'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Home, Heart, Globe, Moon, LogOut } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useThemePreference, type ThemePreference } from '@/lib/theme/use-theme-preference';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MenuRow } from '@/components/ui/menu-row';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { RightRail } from '@/features/feed/components/right-rail';

// Page dédiée (pas /profil directement) pour le nouvel onglet "Menu" de la bande mobile — /profil
// reste l'affiche complète du compte (avatar, activités, coordonnées), /parametres est le hub
// réglages qui y renvoie ainsi que vers modifier le profil, la langue, mes annonces, etc. Demandé
// explicitement pour séparer "voir mon profil" de "gérer mes réglages".
export default function ParametresPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { preference: themePreference, setTheme } = useThemePreference();

  const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t.profile.themeSystem },
    { value: 'light', label: t.profile.themeLight },
    { value: 'dark', label: t.profile.themeDark },
  ];

  function handleLogout() {
    clearSession();
    router.push('/connexion');
  }

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto py-3 sm:py-6 space-y-4">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.profile.settingsTitle}</h1>

        {isAuthenticated && user ? (
          <Link
            href="/profil"
            className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-4 hover:border-brand-primary/40 transition"
          >
            <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={48} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-content-main truncate">{user.fullName}</p>
              <p className="text-xs text-content-muted">{t.profile.viewProfile}</p>
            </div>
          </Link>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-4 text-center">
            <p className="text-content-main font-semibold mb-3">{t.profile.notLoggedIn}</p>
            <Link href="/connexion" className="inline-block">
              <Button size="sm">{t.profile.login}</Button>
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div>
            <h2 className="text-sm font-bold text-content-main mb-2 px-1">{t.profile.myAccount}</h2>
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-1.5 space-y-0.5">
              <MenuRow href="/profil/modifier" icon={Pencil} label={t.profile.edit} />
              <MenuRow href="/mes-biens" icon={Home} label={t.profile.myListings} />
              <MenuRow href="/favoris" icon={Heart} label={t.profile.myFavorites} />
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-content-main mb-2 px-1">{t.profile.preferences}</h2>
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-1.5 space-y-0.5">
            <div className="flex items-center gap-3 px-4 py-2">
              <Globe size={18} className="text-content-main shrink-0" />
              <span className="flex-1 text-sm font-medium text-content-main">{t.profile.language}</span>
              <LanguageSwitcher />
            </div>
            {/* "Système" (par défaut) suit `prefers-color-scheme`, sans rien à choisir — un choix
                explicite Clair/Sombre prend le dessus quel que soit le système (voir
                useThemePreference et les blocs `@media`/`[data-theme]` dans globals.css). */}
            <div className="px-4 py-2.5 space-y-2">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-content-main shrink-0" />
                <span className="flex-1 text-sm font-medium text-content-main">{t.profile.darkMode}</span>
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-stroke-default bg-surface-app p-1 text-xs font-semibold">
                {THEME_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={themePreference === value}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg transition ${
                      themePreference === value
                        ? 'bg-brand-primary text-white'
                        : 'text-content-muted hover:text-content-main'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-1.5">
            <MenuRow icon={LogOut} label={t.profile.logout} danger onClick={handleLogout} />
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
