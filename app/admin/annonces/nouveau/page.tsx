'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useCreatePropertyAsAdmin } from '@/features/admin/hooks/use-create-property-as-admin';
import { TargetUserPicker } from '@/features/admin/components/target-user-picker';
import { PropertyForm, type PropertyFormHandle } from '@/features/listings/components/property-form';
import { ListingPreview } from '@/features/listings/components/listing-preview';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import type { AdminSearchUser } from '@/features/admin/types';
import type { ListingPhotoItem, PropertyFormValues } from '@/features/search/types/listing.types';

type Step = 'step1' | 'step2' | 'step3' | 'preview';

// Mêmes étapes que app/annonce/nouvelle/page.tsx (PropertyForm/ListingPreview réutilisés tels
// quels) — seule différence : un TargetUserPicker obligatoire avant de commencer, et la
// publication passe par POST /properties/admin (useCreatePropertyAsAdmin) au lieu de /properties,
// sans vérification de téléphone côté serveur (voir PropertiesService.create, adminContext).
export default function NouvelleAnnonceAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const { mutateAsync, isPending } = useCreatePropertyAsAdmin();

  const [targetUser, setTargetUser] = useState<AdminSearchUser | null>(null);
  const [step, setStep] = useState<Step>('step1');
  const [draft, setDraft] = useState<PropertyFormValues | null>(null);
  const [draftPhotos, setDraftPhotos] = useState<ListingPhotoItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const formRef = useRef<PropertyFormHandle>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  async function handlePublish() {
    if (!draft || !targetUser) return;
    setErrorMessage(null);
    try {
      await mutateAsync({ values: draft, photos: draftPhotos, targetUserId: targetUser.id });
      setIsPublished(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t.adminCreatePropertyPage.publishError));
    }
  }

  if (!isAdminUser) return null;

  let content: React.ReactNode;

  if (isPublished) {
    content = (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <CheckCircle2 size={40} className="mx-auto text-brand-primary" />
        <p className="text-content-main font-semibold">{t.listing.publishSuccess}</p>
        <Link href="/admin/annonces" className="inline-block mt-2">
          <Button size="sm">{t.adminAnnoncesPage.title}</Button>
        </Link>
      </div>
    );
  } else if (!targetUser) {
    content = (
      <div className="max-w-md mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <p className="text-sm font-semibold text-content-main mb-2">{t.adminCreatePropertyPage.selectUserFirst}</p>
        <TargetUserPicker selected={targetUser} onSelect={setTargetUser} />
      </div>
    );
  } else {
    content = (
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary-text">
          {step === 'preview' ? t.listing.preview : t.adminCreatePropertyPage.title}
        </h1>
        <p className="text-content-muted text-[0.85rem] font-medium mt-1">{t.adminCreatePropertyPage.subtitle}</p>

        <div className="mt-3">
          <TargetUserPicker selected={targetUser} onSelect={setTargetUser} />
        </div>

        <div className="mt-5 bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-5">
          {step === 'preview' ? (
            draft && <ListingPreview values={draft} photos={draftPhotos} />
          ) : (
            <PropertyForm
              ref={formRef}
              step={step === 'step1' ? 1 : step === 'step2' ? 2 : 3}
              initialValues={draft ?? undefined}
              initialPhotos={draftPhotos}
              publisherRole={targetUser.role}
              onNext={() => setStep(step === 'step1' ? 'step2' : 'step3')}
              onPreview={(values, photos) => {
                setDraft(values);
                setDraftPhotos(photos);
                setStep('preview');
              }}
            />
          )}
        </div>

        {step === 'preview' && errorMessage && (
          <div className="mt-4">
            <FormErrorBanner message={errorMessage} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          {(step === 'step2' || step === 'step3') && (
            <Button type="button" variant="outline" onClick={() => setStep(step === 'step2' ? 'step1' : 'step2')}>
              {t.listing.back}
            </Button>
          )}
          {step === 'preview' && (
            <Button type="button" variant="outline" onClick={() => setStep('step3')}>
              {t.listing.edit}
            </Button>
          )}
          <div className="flex-1">
            {step === 'preview' ? (
              <Button type="button" className="w-full" disabled={isPending} onClick={handlePublish}>
                {isPending ? t.listing.publishing : t.listing.publish}
              </Button>
            ) : (
              <Button type="button" className="w-full" onClick={() => formRef.current?.submit()}>
                {step === 'step3' ? t.listing.preview : t.listing.next}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 lg:px-0">
      <Link
        href="/admin/annonces"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main pt-3 sm:pt-6"
      >
        <ArrowLeft size={20} />
        {t.adminAnnoncesPage.title}
      </Link>
      {content}
    </div>
  );
}
