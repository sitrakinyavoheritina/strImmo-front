'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Home, Heart, LogOut, ChevronRight, Pencil } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useFavoritesStore } from '@/lib/state/use-favorites-store';
import { useProperties } from '@/features/search/hooks/use-properties';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';

function MenuRow({ href, icon: Icon, label, danger, onClick }: {
  href?: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon size={18} />
      <span className="flex-1 text-left">{label}</span>
      {href && <ChevronRight size={16} className="text-content-muted" />}
    </>
  );
  const className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
    danger ? 'text-danger hover:bg-danger/10' : 'text-content-main hover:bg-surface-app'
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function ProfilPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  const { data: myProperties } = useProperties(
    user ? { ownerId: user.id, status: 'approved' } : undefined,
    { enabled: !!user }
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="flex px-3 sm:px-6 lg:px-0">
        <div className="flex-1 min-w-0 max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-content-main font-semibold">{t.profile.notLoggedIn}</p>
          <Link href="/connexion" className="inline-block mt-4">
            <Button size="sm">{t.profile.login}</Button>
          </Link>
        </div>
        <RightRail />
      </div>
    );
  }

  function handleLogout() {
    clearSession();
    router.push('/connexion');
  }

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-3xl mx-auto pb-10">
      <div className="h-28 sm:h-36 bg-gradient-to-br from-brand-primary to-brand-primary-hover flex items-end px-4 sm:px-6 pb-4">
        <span className="text-white/80 text-xs font-bold uppercase tracking-wide">{t.profile.myAccount}</span>
      </div>

      <div className="px-4 sm:px-6 -mt-10">
        <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4">
          <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={64} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-content-main truncate">{user.fullName}</p>
            {user.email && <p className="text-xs text-content-muted truncate">{user.email}</p>}
          </div>
          <Link href="/profil/modifier">
            <Button size="sm" variant="outline">
              <Pencil size={14} />
              {t.profile.edit}
            </Button>
          </Link>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-bold text-content-main mb-2">{t.profile.activities}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3.5 text-center">
              <p className="text-xl font-bold text-content-main">{myProperties?.length ?? 0}</p>
              <p className="text-xs text-content-muted mt-0.5">{t.profile.publishedListings}</p>
            </div>
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3.5 text-center">
              <p className="text-xl font-bold text-content-main">{favoritesCount}</p>
              <p className="text-xs text-content-muted mt-0.5">{t.profile.savedListings}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-bold text-content-main mb-2">{t.profile.myInformation}</h2>
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl divide-y divide-stroke-default">
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-content-main">
              <Phone size={16} className="text-content-muted" />
              {user.phone}
            </div>
            {user.email && (
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-content-main">
                <Mail size={16} className="text-content-muted" />
                {user.email}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 bg-surface-card border border-stroke-default/80 rounded-xl p-1.5 space-y-0.5">
          <MenuRow href="/mes-biens" icon={Home} label={t.profile.myListings} />
          <MenuRow href="/favoris" icon={Heart} label={t.profile.myFavorites} />
          <MenuRow icon={LogOut} label={t.profile.logout} danger onClick={handleLogout} />
        </div>
      </div>
      </div>
      <RightRail />
    </div>
  );
}
