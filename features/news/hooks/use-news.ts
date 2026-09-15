import { useQuery } from '@tanstack/react-query';
import { newsApi } from '../services/news-api';
import { mapApiNewsArticle } from '../services/news-mapper';

export function useNewsList() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => (await newsApi.list()).map(mapApiNewsArticle),
  });
}

export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => mapApiNewsArticle(await newsApi.getById(id)),
    enabled: !!id,
  });
}
