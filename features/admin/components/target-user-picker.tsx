'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useAdminSearchUsers } from '../hooks/use-admin-search-users';
import type { AdminSearchUser } from '../types';

const ROLE_LABEL_KEY = {
  owner: 'roleOwner',
  tenant: 'roleTenant',
  agent: 'roleAgent',
  agency: 'roleAgency',
  admin: 'roleAdmin',
  superadmin: 'roleSuperadmin',
} as const;

// Recherche inline (pas une modale : c'est la première étape obligatoire des pages admin
// "créer pour un utilisateur", pas une action secondaire) — même pattern que NewConversationModal
// (features/messages/components), voir AuthService.searchUsersAsAdmin.
export function TargetUserPicker({
  selected,
  onSelect,
}: {
  selected: AdminSearchUser | null;
  onSelect: (user: AdminSearchUser | null) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: results, isFetching } = useAdminSearchUsers(debouncedQuery);

  if (selected) {
    const fullName = `${selected.firstName} ${selected.lastName}`.trim();
    return (
      <div className="flex items-center gap-3 bg-surface-app border border-stroke-default rounded-xl p-2.5">
        <Avatar name={fullName || selected.phone || '?'} size={38} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-content-main truncate">{fullName || t.adminUsersPage.noName}</p>
          <p className="text-[0.85rem] text-content-muted">
            {t.auth[ROLE_LABEL_KEY[selected.role]]}
            {selected.phone ? ` · ${selected.phone}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 text-[0.85rem] font-semibold text-brand-primary hover:underline"
        >
          {t.targetUserPicker.clear}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-full border border-stroke-default bg-surface-app px-3.5 py-2.5">
        <Search size={16} className="text-content-muted shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.targetUserPicker.placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-content-main placeholder-content-muted outline-none"
        />
      </div>

      {debouncedQuery.trim().length >= 2 && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-stroke-default bg-surface-card">
          {isFetching ? (
            <p className="text-[0.85rem] text-content-muted text-center py-3">{t.targetUserPicker.searching}</p>
          ) : results && results.length > 0 ? (
            <div className="divide-y divide-stroke-default">
              {results.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`.trim();
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelect(user)}
                    className="w-full flex items-center gap-3 py-2 px-2.5 text-left hover:bg-surface-app transition"
                  >
                    <Avatar name={fullName || user.phone || '?'} size={34} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-content-main truncate">{fullName || t.adminUsersPage.noName}</p>
                      <p className="text-[0.85rem] text-content-muted">
                        {t.auth[ROLE_LABEL_KEY[user.role]]}
                        {user.phone ? ` · ${user.phone}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[0.85rem] text-content-muted text-center py-3">{t.targetUserPicker.noResults}</p>
          )}
        </div>
      )}
    </div>
  );
}
