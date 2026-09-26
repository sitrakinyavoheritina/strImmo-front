'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useErrorLogs } from '@/features/admin/hooks/use-error-logs';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';
import type { ErrorLogItem, ErrorLogSource } from '@/features/admin/types';

const PAGE_SIZE = 50;
const STATUS_CODES = [400, 401, 403, 409, 500, 503];
const SOURCES: ErrorLogSource[] = ['http', 'sms', 'email', 'push'];

function LogRow({ log }: { log: ErrorLogItem }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isServerError = (log.statusCode ?? 0) >= 500 || log.level === 'error';
  return (
    <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-1.5 py-0.5 text-[12px] font-bold ${
            isServerError ? 'bg-danger/10 text-danger' : 'bg-brand-secondary/10 text-brand-secondary-text'
          }`}
        >
          {log.statusCode ?? log.source.toUpperCase()}
        </span>
        <span className="rounded-md bg-surface-app px-1.5 py-0.5 text-[12px] font-semibold text-content-muted">
          {t.adminErrorLogsPage.sources[log.source]}
        </span>
        <span className="text-[12px] text-content-muted">{new Date(log.createdAt).toLocaleString()}</span>
      </div>

      <p className="mt-1.5 text-sm font-semibold text-content-main break-words">{log.message}</p>
      {log.path && (
        <p className="text-[0.85rem] text-content-muted font-mono break-all">
          {log.method} {log.path}
        </p>
      )}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-content-muted">
        {log.identifierMasked && (
          <span>
            {t.adminErrorLogsPage.identifier} : <span className="font-mono">{log.identifierMasked}</span>
          </span>
        )}
        {log.userId && (
          <span className="break-all">
            {t.adminErrorLogsPage.account} : <span className="font-mono">{log.userId}</span>
          </span>
        )}
      </div>

      {(log.stack || log.userAgent) && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="mt-1.5 flex items-center gap-1 text-[0.85rem] font-semibold text-brand-primary hover:underline"
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {t.adminErrorLogsPage.details}
          </button>
          {isOpen && (
            <div className="mt-1.5 space-y-1.5 rounded-lg bg-surface-app p-2">
              {log.userAgent && <p className="text-[12px] text-content-muted break-all">{log.userAgent}</p>}
              {log.stack && (
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-[11px] text-content-muted">
                  {log.stack}
                </pre>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Journal des erreurs récentes (refus 400/401/403/409, erreurs 500, échecs SMS/email/push) —
// pour retrouver ce qui s'est passé quand un client se plaint. Téléphone et email sont masqués ;
// la recherche accepte pourtant un numéro ou un email COMPLET (comparé par empreinte).
export default function AdminErrorLogsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusCode, setStatusCode] = useState<number | undefined>();
  const [source, setSource] = useState<ErrorLogSource | undefined>();
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data, isLoading } = useErrorLogs({ search: search || undefined, statusCode, source, limit }, isAdminUser);

  if (!isAdminUser) return null;

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLimit(PAGE_SIZE);
    setSearch(searchInput.trim());
  }

  const selectClass =
    'rounded-xl border border-stroke-default bg-surface-card px-2.5 py-2 text-sm text-content-main outline-none focus:border-brand-primary';

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.adminErrorLogsPage.title}</h1>
        <p className="mt-1 text-[0.85rem] text-content-muted">
          {t.adminErrorLogsPage.subtitle.replace('%days%', String(data?.retentionDays ?? 20))}
        </p>

        <form onSubmit={handleSearch} className="mt-3 flex gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t.adminErrorLogsPage.searchPlaceholder}
            className="flex-1 min-w-0 rounded-xl border border-stroke-default bg-surface-card px-3 py-2 text-sm text-content-main placeholder-content-muted outline-none focus:border-brand-primary"
          />
          <Button type="submit" size="sm">
            <Search size={16} />
            {t.adminErrorLogsPage.search}
          </Button>
        </form>

        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={statusCode ?? ''}
            onChange={(event) => {
              setLimit(PAGE_SIZE);
              setStatusCode(event.target.value ? Number(event.target.value) : undefined);
            }}
            aria-label={t.adminErrorLogsPage.code}
            className={selectClass}
          >
            <option value="">{t.adminErrorLogsPage.allCodes}</option>
            {STATUS_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <select
            value={source ?? ''}
            onChange={(event) => {
              setLimit(PAGE_SIZE);
              setSource((event.target.value || undefined) as ErrorLogSource | undefined);
            }}
            aria-label={t.adminErrorLogsPage.source}
            className={selectClass}
          >
            <option value="">{t.adminErrorLogsPage.allSources}</option>
            {SOURCES.map((value) => (
              <option key={value} value={value}>
                {t.adminErrorLogsPage.sources[value]}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-content-muted">{t.search.searching}</p>
        ) : data && data.items.length > 0 ? (
          <>
            <p className="mt-3 text-[0.85rem] text-content-muted">
              {data.total} {t.adminErrorLogsPage.results}
            </p>
            <div className="mt-2 space-y-2">
              {data.items.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </div>
            {data.items.length < data.total && (
              <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                {t.adminErrorLogsPage.loadMore}
              </Button>
            )}
          </>
        ) : (
          <p className="py-12 text-center text-sm text-content-muted">{t.adminErrorLogsPage.empty}</p>
        )}
      </div>
      <RightRail />
    </div>
  );
}
