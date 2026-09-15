// Port du contrat mobile (Onina-mobile/src/features/news/types/news.types.ts), avec `content` en
// plus (l'écran mobile n'a pas de fiche détail, celui-ci en a une, voir app/actus/[id]/page.tsx).
export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  coverImageUrl?: string;
  publishedAt: string;
};

export type NewsFormValues = {
  title: string;
  summary: string;
  content?: string;
  publishedAt?: string;
};
