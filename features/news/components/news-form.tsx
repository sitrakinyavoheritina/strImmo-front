'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FieldLabel, FormInput } from '@/components/ui/form-controls';
import { Button } from '@/components/ui/button';
import type { NewsArticle, NewsFormValues } from '../types/news.types';

type NewsFormProps = {
  initialValues?: NewsArticle;
  onSubmit: (values: NewsFormValues, cover: File | null) => void;
  isSubmitting: boolean;
  submitLabel: string;
};

// Champ date au format `yyyy-MM-dd` attendu par `<input type="date">` — `publishedAt` côté
// serveur est un timestamp ISO complet.
function toDateInputValue(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10);
}

/** Formulaire de création/modification d'un article — partagé entre /admin/actus/nouveau et
 * /admin/actus/[id], seuls `initialValues`/`submitLabel` changent. */
export function NewsForm({ initialValues, onSubmit, isSubmitting, submitLabel }: NewsFormProps) {
  const { t } = useTranslation();
  const coverInputId = useId();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [summary, setSummary] = useState(initialValues?.summary ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [publishedAt, setPublishedAt] = useState(toDateInputValue(initialValues?.publishedAt));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(initialValues?.coverImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setError(t.adminNewsPage.formRequiredFields);
      return;
    }
    setError(null);
    onSubmit(
      {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim() || undefined,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      },
      coverFile
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div>
        <FieldLabel>{t.adminNewsPage.coverLabel}</FieldLabel>
        <label
          htmlFor={coverInputId}
          className="relative flex items-center justify-center w-full h-40 rounded-xl border border-dashed border-stroke-default bg-surface-app overflow-hidden cursor-pointer hover:border-brand-primary/60 transition"
        >
          {coverPreviewUrl ? (
            <Image src={coverPreviewUrl} alt="" fill className="object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-content-muted text-[0.85rem] font-medium">
              <ImagePlus size={22} />
              {t.adminNewsPage.coverPlaceholder}
            </span>
          )}
        </label>
        <input id={coverInputId} type="file" accept="image/*" className="sr-only" onChange={handleCoverChange} />
      </div>

      <FormInput label={t.adminNewsPage.titleLabel} value={title} onChange={setTitle} placeholder={t.adminNewsPage.titlePlaceholder} />
      <FormInput label={t.adminNewsPage.summaryLabel} value={summary} onChange={setSummary} placeholder={t.adminNewsPage.summaryPlaceholder} />

      <div>
        <FieldLabel>{t.adminNewsPage.contentLabel}</FieldLabel>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t.adminNewsPage.contentPlaceholder}
          rows={6}
          className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none"
        />
      </div>

      <div>
        <FieldLabel>{t.adminNewsPage.publishedAtLabel}</FieldLabel>
        <input
          type="date"
          value={publishedAt}
          onChange={(event) => setPublishedAt(event.target.value)}
          className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
        />
      </div>

      {error && <p className="text-[0.85rem] text-danger">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t.adminNewsPage.saving : submitLabel}
      </Button>
    </form>
  );
}
