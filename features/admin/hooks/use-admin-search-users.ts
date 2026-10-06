import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

// Même garde que useSearchContacts (features/messages/hooks/use-messages.ts) : le backend refuse
// de toute façon en dessous de 2 caractères (voir AuthService.searchUsersAsAdmin). Le composant
// appelant est responsable du debounce (voir useDebouncedValue), comme pour la recherche de
// contacts.
export function useAdminSearchUsers(query: string) {
  return useQuery({
    queryKey: ['admin-search-users', query],
    queryFn: () => adminApi.searchUsers(query),
    enabled: query.trim().length >= 2,
  });
}
