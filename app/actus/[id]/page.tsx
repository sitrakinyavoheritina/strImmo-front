'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useNewsArticle } from '@/features/news/hooks/use-news';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';

function formatPublishedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ActuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { data: article, isLoading } = useNewsArticle(id);

  if (isLoading) {
    return (
      <div className="flex">
        <div className="flex-1 min-w-0 max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        </div>
        <RightRail />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex">
        <div className="flex-1 min-w-0 max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-lg font-bold text-content-main">{t.newsPage.notFoundTitle}</h1>
          <Link href="/actus" className="inline-block mt-4">
            <Button size="sm">{t.newsPage.backToList}</Button>
          </Link>
        </div>
        <RightRail />
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
        >
          <ArrowLeft size={16} />
          {t.newsPage.backToList}
        </button>

        {article.coverImageUrl && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-stroke-default mb-4">
            <Image src={article.coverImageUrl} alt="" fill priority className="object-cover" />
          </div>
        )}

        <p className="text-[0.85rem] text-content-muted">{formatPublishedDate(article.publishedAt, locale)}</p>
        <h1 className="text-xl sm:text-2xl font-bold text-content-main mt-1">{article.title}</h1>
        <p className="text-sm text-content-muted mt-2">{article.summary}</p>

        {article.content && (
          <p className="text-sm text-content-main leading-relaxed mt-4 whitespace-pre-line">{article.content}</p>
        )}
      </div>
      <RightRail />
    </div>
  );
}
