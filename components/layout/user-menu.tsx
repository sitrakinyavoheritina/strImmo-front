'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { Avatar } from '@/components/ui/avatar';
import type { User as AuthUser } from '@/features/auth/types';

/** Avatar + nom dans la topbar : ouvre un choix (voir le profil / se déconnecter) au clic,
 * plutôt que de naviguer directement vers /profil — même pattern que LanguageMenu. */
export function UserMenu({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    setIsOpen(false);
    clearSession();
    router.push('/connexion');
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
            <Link
              href="/profil"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-content-main hover:bg-surface-app transition"
            >
              <User size={15} />
              {t.profile.viewProfile}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition"
            >
              <LogOut size={15} />
              {t.profile.logout}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
