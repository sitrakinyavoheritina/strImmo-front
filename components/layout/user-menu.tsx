'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useThemePreference, type ThemePreference } from '@/lib/theme/use-theme-preference';
import { authService } from '@/features/auth/services/auth-service';
import { Avatar } from '@/components/ui/avatar';
import type { User as AuthUser } from '@/features/auth/types';

/** Avatar + nom dans la topbar : ouvre un choix (voir le profil / se déconnecter) au clic,
 * plutôt que de naviguer directement vers /profil — même pattern que LanguageMenu. */
export function UserMenu({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { preference: themePreference, setTheme } = useThemePreference();
  const [isOpen, setIsOpen] = useState(false);
  // Accès rapide (juste clair/sombre, pas "système") : le choix complet à 3 états reste dans
  // /parametres — demandé explicitement ici comme un raccourci pratique, pas un doublon complet.
  const isDark = themePreference === 'dark';

  function handleLogout() {
    setIsOpen(false);
    clearSession();
    router.push('/connexion');
  }

  // Cette barre ne s'affiche que pour un utilisateur connecté (voir la prop `user`, obligatoire) —
  // persisté sur le compte pour retrouver le même réglage sur un autre appareil, comme dans
  // /parametres.
  function handleSetTheme(next: ThemePreference) {
    setTheme(next);
    updateUser({ themePreference: next });
    authService.updatePreferences({ themePreference: next }).catch(() => {});
    setIsOpen(false);
  }

  return (
    <div className="relative hidden sm:block shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={user.fullName}
        aria-expanded={isOpen}
        className="flex items-center gap-2"
      >
        <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={32} />
        <span className="hidden lg:inline text-sm font-semibold text-content-main">{user.fullName}</span>
        <ChevronDown size={14} className={`hidden lg:inline text-content-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-surface-card border border-stroke-default rounded-xl shadow-lg py-1">
            {/* Absent pour un admin : /profil ne fait pas partie de ses routes autorisées (voir
                AdminRouteGuard). */}
            {!isAdmin(user) && (
              <Link
                href="/profil"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-content-main hover:bg-surface-app transition"
              >
                <User size={15} />
                {t.profile.viewProfile}
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition"
            >
              <LogOut size={15} />
              {t.profile.logout}
            </button>

            <div className="mt-1 pt-1 px-3 pb-1 border-t border-stroke-default">
              <div className="flex items-center gap-1 rounded-lg border border-stroke-default bg-surface-app p-1 text-[0.85rem] font-semibold">
                <button
                  type="button"
                  onClick={() => handleSetTheme('light')}
                  aria-pressed={!isDark}
                  className={`flex-1 px-2 py-1 rounded-md transition ${
                    !isDark ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
                  }`}
                >
                  {t.profile.themeLight}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTheme('dark')}
                  aria-pressed={isDark}
                  className={`flex-1 px-2 py-1 rounded-md transition ${
                    isDark ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
                  }`}
                >
                  {t.profile.themeDark}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
