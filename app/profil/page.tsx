'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Home, Heart, LogOut, Pencil } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useFavoriteIds } from '@/features/search/hooks/use-favorites';
import { useProperties } from '@/features/search/hooks/use-properties';
import { ROLE_LABEL_KEY } from '@/features/auth/utils/role-label';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MenuRow } from '@/components/ui/menu-row';
import { RightRail } from '@/features/feed/components/right-rail';
import { unsubscribeOnLogout } from '@/lib/push/push-client';

export default function ProfilPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const favoritesCount = useFavoriteIds().data?.length ?? 0;

  const { data: myProperties } = useProperties(
    user ? { ownerId: user.id, status: 'approved' } : undefined,
    { enabled: !!user }
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="flex px-3 sm:px-6 lg:px-0">
        <div className="flex-1 min-w-0 max-w-md mx-auto px-4 py-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo décoratif (SVG statique dans /public), pas besoin de l'optimiseur next/image */}
          <img src="/logo.svg" alt="Onina" className="h-14 w-auto mx-auto" />
          <p className="mt-2 font-extrabold tracking-tight">
            <span className="text-xl text-brand-secondary-text">Onina</span>
            <span className="text-base text-brand-primary">.mg</span>
          </p>
          <p className="mt-5 text-lg text-content-main font-semibold">{t.profile.notLoggedIn}</p>
          <p className="mt-1 text-sm text-content-muted">{t.profile.notLoggedInHint}</p>
          <div className="mt-5 flex flex-col gap-2.5 max-w-xs mx-auto">
            <Link
              href="/connexion"
              className="block py-2.5 px-4 text-sm font-semibold rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/20 transition active:scale-[0.98]"
            >
              {t.profile.login}
            </Link>
            <Link
              href="/inscription"
              className="block py-2.5 px-4 text-sm font-semibold rounded-xl bg-surface-app hover:bg-stroke-default border border-stroke-default text-content-main transition active:scale-[0.98]"
            >
              {t.auth.signUp}
            </Link>
          </div>
        </div>
        <RightRail />
      </div>
    );
  }

  function handleLogout() {
    unsubscribeOnLogout();
    clearSession();
    router.push('/connexion');
  }

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-3xl mx-auto pb-10">
      {/* `relative` + `overflow-hidden` : la photo de couverture (facultative, voir
          profil/modifier) remplit ce bandeau en `fill`, le dégradé sert de repli si aucune n'est
          définie ET d'assombrissement (voir l'overlay ci-dessous) pour que le libellé blanc reste
          lisible même sur une photo claire. */}
      <div className="relative h-28 sm:h-36 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary-hover flex items-end px-4 sm:px-6 pb-4">
        {user.coverUrl && (
          <>
            <Image src={user.coverUrl} alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/25" />
          </>
        )}
        <span className="relative text-white/80 text-[0.85rem] font-bold uppercase tracking-wide">
          {t.profile.myAccount}
        </span>
      </div>

      {/* Plus de chevauchement négatif avec le bandeau ci-dessus (contrairement à avant) : cette
          carte contenait autrefois l'avatar qui débordait volontairement par-dessus le bandeau —
          ce n'est plus le cas (l'avatar est maintenant entièrement dans la carte), et garder le
          chevauchement aurait fait passer le bouton "Modifier le profil" sous le bandeau. */}
      <div className="px-4 sm:px-6 mt-3">
        <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-4 sm:p-5">
          {/* Bouton au-dessus de l'identité (pas à côté, comme avant) : à côté, il finissait par
              recouvrir le nom/l'email sur les largeurs étroites — remonté explicitement. */}
          <div className="flex justify-end mb-3">
            <Link href="/profil/modifier">
              <Button size="sm" variant="outline">
                <Pencil size={14} />
                {t.profile.edit}
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Avatar name={user.fullName} imageUrl={user.avatarUrl} size={64} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-content-main truncate">{user.fullName}</p>
              <p className="text-[0.85rem] font-semibold text-brand-primary">{t.auth[ROLE_LABEL_KEY[user.role]]}</p>
              {user.email && <p className="text-[0.85rem] text-content-muted truncate">{user.email}</p>}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-bold text-content-main mb-2">{t.profile.activities}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3.5 text-center">
              <p className="text-xl font-bold text-content-main">{myProperties?.length ?? 0}</p>
              <p className="text-[0.85rem] text-content-muted mt-0.5">{t.profile.publishedListings}</p>
            </div>
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3.5 text-center">
              <p className="text-xl font-bold text-content-main">{favoritesCount}</p>
              <p className="text-[0.85rem] text-content-muted mt-0.5">{t.profile.savedListings}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-bold text-content-main mb-2">{t.profile.myInformation}</h2>
          <div className="bg-surface-card border border-stroke-default/80 rounded-xl divide-y divide-stroke-default">
            {user.phone && (
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-content-main">
                <Phone size={16} className="text-content-muted" />
                {user.phone}
              </div>
            )}
            {user.phone2 && (
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-content-main">
                <Phone size={16} className="text-content-muted" />
                {user.phone2}
              </div>
            )}
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
