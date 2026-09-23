'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useProperties } from '@/features/search/hooks/use-properties';
import { Avatar } from '@/components/ui/avatar';
import { FeedList } from '@/features/feed/components/feed-list';
import { RightRail } from '@/features/feed/components/right-rail';
import { ROLE_LABEL_KEY } from '@/features/auth/utils/role-label';

/** Profil public d'un propriétaire/intermédiaire/agence — atteint en cliquant sur son nom/avatar
 * depuis une carte du fil ou la fiche détail d'une annonce (voir feed-property-card.tsx,
 * feed-property-row.tsx, app/annonce/[id]/page.tsx). Contrairement à /profil (soi-même), pas de
 * route publique dédiée côté backend pour l'identité — dérivée des annonces elles-mêmes
 * (`authorName`/`authorAvatarUrl`/`publisherType`, déjà renvoyés par `GET /properties?ownerId=`),
 * ce qui évite un endpoint backend séparé pour un besoin aussi simple (nom, avatar, rôle, nombre
 * d'annonces). Conséquence acceptée : si cette personne n'a aucune annonce disponible, son identité
 * n'est pas connaissable ici — état "profil introuvable" plutôt qu'un profil vide mais identifié. */
export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (currentUser?.id === id) router.replace('/profil');
  }, [currentUser, id, router]);

  const { data: properties, isLoading } = useProperties({ ownerId: id, status: 'approved' }, { enabled: !!id });
  const author = properties?.[0];

  if (isLoading) {
    return (
      <div className="flex px-3 sm:px-6 lg:px-0">
        <div className="flex-1 min-w-0 max-w-3xl mx-auto py-10 text-center text-sm text-content-muted">
          {t.search.searching}
        </div>
        <RightRail />
      </div>
    );
  }

  if (!author?.authorName) {
    return (
      <div className="flex px-3 sm:px-6 lg:px-0">
        <div className="flex-1 min-w-0 max-w-3xl mx-auto py-16 text-center">
          <p className="font-semibold text-content-main">{t.publicProfilePage.notFound}</p>
        </div>
        <RightRail />
      </div>
    );
  }

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-3xl mx-auto pb-10">
        <div className="h-28 sm:h-36 bg-gradient-to-br from-brand-primary to-brand-primary-hover" />

        <div className="px-4 sm:px-6 -mt-10">
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4">
            <Avatar name={author.authorName} imageUrl={author.authorAvatarUrl} size={64} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-content-main truncate">{author.authorName}</p>
              {author.publisherType && (
                <p className="text-[0.85rem] text-content-muted">{t.auth[ROLE_LABEL_KEY[author.publisherType]]}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3.5 text-center max-w-[200px]">
              <p className="text-xl font-bold text-content-main">{properties?.length ?? 0}</p>
              <p className="text-[0.85rem] text-content-muted mt-0.5">{t.publicProfilePage.listingsAvailable}</p>
            </div>
          </div>

          {/* Pas de stories ici : on arrive sur ce profil en cliquant sur le nom du vendeur, ce qui doit
              montrer ses biens, pas rouvrir les stories. */}
          <h2 className="mt-6 mb-3 text-base font-bold text-content-main">
            {t.publicProfilePage.publishedBy} {author.authorName}
          </h2>

          {/* `properties` contient forcément au moins l'annonce ayant permis de résoudre
              `author` ci-dessus (voir le garde "profil introuvable" plus haut) — jamais vide ici. */}
          <FeedList properties={properties!} />
        </div>
      </div>
      <RightRail />
    </div>
  );
}
