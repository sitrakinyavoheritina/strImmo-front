import { apiClient } from '@/lib/api/client';
import type { NewsFormValues } from '../types/news.types';

// Forme brute renvoyée par strImmo (voir strImmo/src/news/entities/news-article.entity.ts).
export type ApiNewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
};

function buildFormData(values: NewsFormValues, cover?: File | null): FormData {
  const form = new FormData();
  form.append('title', values.title);
  form.append('summary', values.summary);
  if (values.content) form.append('content', values.content);
  if (values.publishedAt) form.append('publishedAt', values.publishedAt);
  if (cover) form.append('cover', cover);
  return form;
}

export const newsApi = {
  list: () => apiClient.get<ApiNewsArticle[]>('/news').then((r) => r.data),

  getById: (id: string) => apiClient.get<ApiNewsArticle>(`/news/${id}`).then((r) => r.data),

  create: (values: NewsFormValues, cover?: File | null) =>
    apiClient
      .post<ApiNewsArticle>('/news', buildFormData(values, cover), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  update: (id: string, values: NewsFormValues, cover?: File | null) =>
    apiClient
      .patch<ApiNewsArticle>(`/news/${id}`, buildFormData(values, cover), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/news/${id}`),
};
