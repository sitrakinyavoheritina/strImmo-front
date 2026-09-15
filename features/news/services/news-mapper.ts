import type { ApiNewsArticle } from './news-api';
import type { NewsArticle } from '../types/news.types';

export function mapApiNewsArticle(api: ApiNewsArticle): NewsArticle {
  return {
    id: api.id,
    title: api.title,
    summary: api.summary,
    content: api.content ?? undefined,
    coverImageUrl: api.coverImageUrl ?? undefined,
    publishedAt: api.publishedAt,
  };
}
