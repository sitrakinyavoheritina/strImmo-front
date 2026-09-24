'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useProperty } from '@/features/search/hooks/use-property';
import { useDeleteProperty } from '@/features/search/hooks/use-delete-property';
import { formatPrice } from '@/features/search/utils/format-price';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { RightRail } from '@/features/feed/components/right-rail';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Suppression d'un bien à partir de son identifiant (admin/superadmin) — le bien est d'abord
// affiché pour vérifier que c'est le bon avant de confirmer, la suppression est définitive.
export default function AdminSupprimerBienPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const id = input.trim();
  const isValidId = UUID_PATTERN.test(id);
  const { data: property, isFetching, isError } = useProperty(isAdminUser && isValidId ? id : undefined);
  const { mutate: deleteProperty, isPending } = useDeleteProperty();

  if (!isAdminUser) return null;

  function handleDelete() {
    if (!property) return;
    if (!window.confirm(`${t.adminDeleteListing.confirm} « ${property.title} » ?`)) return;
    deleteProperty(property.id, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: ['property', property.id] });
        setMessage({ type: 'ok', text: t.adminDeleteListing.success });
        setInput('');
      },
      onError: (error) => setMessage({ type: 'error', text: getErrorMessage(error, t.adminDeleteListing.error) }),
    });
  }

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminDeleteListing.title}</h1>
        <p className="text-sm text-content-muted mt-1">{t.adminDeleteListing.subtitle}</p>

        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setMessage(null);
          }}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="mt-4 w-full rounded-xl border border-stroke-default bg-surface-card px-3.5 py-2.5 text-sm font-mono outline-none focus:border-brand-primary"
        />

        {message && (
          <p className={`mt-3 text-sm font-semibold ${message.type === 'ok' ? 'text-emerald-600' : 'text-danger'}`}>
            {message.text}
          </p>
        )}

        {id && !isValidId && <p className="mt-3 text-sm text-danger">{t.adminDeleteListing.invalidId}</p>}
        {isValidId && isFetching && <p className="mt-3 text-sm text-content-muted">{t.search.searching}</p>}
        {isValidId && !isFetching && isError && <p className="mt-3 text-sm text-danger">{t.adminDeleteListing.notFound}</p>}

        {isValidId && property && (
          <div className="mt-4 bg-surface-card border border-stroke-default/80 rounded-2xl p-4">
            <Link href={`/annonce/${property.id}`} className="font-semibold text-content-main hover:underline">
              {property.title}
            </Link>
            <p className="text-[0.85rem] text-content-muted mt-0.5">{property.location}</p>
            <p className="text-sm font-bold text-brand-secondary-text mt-1">{formatPrice(property.price)}</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
            >
              <Trash2 size={16} />
              {t.adminDeleteListing.button}
            </button>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
