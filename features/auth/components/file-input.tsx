'use client';

import { useId, useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

/** Sélecteur de document/photo réutilisable (CIN recto/verso, NIF/STAT, avatar de profil). */
export function FileInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    onChange(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  return (
    <div>
      <label className="block text-xs font-medium text-content-main mb-1">{label}</label>
      <label
        htmlFor={inputId}
        className="flex items-center gap-3 px-3 py-2.5 bg-surface-app border border-dashed border-stroke-default rounded-xl text-sm cursor-pointer hover:border-brand-primary transition"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), pas une image distante à optimiser
          <img src={previewUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        ) : (
          <span className="w-9 h-9 rounded-lg bg-stroke-default flex items-center justify-center shrink-0 text-content-muted">
            <Upload size={16} />
          </span>
        )}
        <span className="flex-1 min-w-0 truncate text-content-main">
          {file ? file.name : t.auth.uploadDocument}
        </span>
        {file && <Check size={16} className="text-brand-primary shrink-0" />}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}
