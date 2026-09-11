'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useCreateProperty } from '@/features/search/hooks/use-create-property';
import { PropertyForm, type PropertyFormHandle } from '@/features/listings/components/property-form';
import { ListingPreview } from '@/features/listings/components/listing-preview';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { RightRail } from '@/features/feed/components/right-rail';
import type { PropertyFormValues } from '@/features/search/types/listing.types';

type Step = 'step1' | 'step2' | 'preview';

// Création d'annonce en 2 étapes (infos essentielles, puis détails du bien) suivies d'un aperçu
// avant publication réelle — port de Onina-mobile/src/features/listings/screens/listing-form-screen.tsx.
export default function NouvelleAnnoncePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const { mutateAsync, isPending } = useCreateProperty();

  const [step, setStep] = useState<Step>('step1');
  const [draft, setDraft] = useState<PropertyFormValues | null>(null);
  const [draftPhotos, setDraftPhotos] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const formRef = useRef<PropertyFormHandle>(null);

  // Impossible de publier sans compte — direction la connexion plutôt qu'un écran intermédiaire
  // à cliquer pour y arriver quand même. Attend `hasHydrated` : sinon, sur un rechargement de
  // page, `isAuthenticated` vaut encore `false` le temps que la session soit relue depuis
  // localStorage, et on redirigerait à tort un utilisateur pourtant déjà connecté.
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  async function handlePublish() {
    if (!draft) return;
    setErrorMessage(null);
    try {
      await mutateAsync({ values: draft, photos: draftPhotos });
      setIsPublished(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  let content: React.ReactNode;

  if (!isAuthenticated || !user) {
    // Rien à afficher ici : le useEffect ci-dessus redirige déjà vers /connexion.
    content = null;
  } else if (user.role === 'tenant') {
    // Un locataire ne peut pas publier d'annonce — même règle côté serveur
    // (strImmo/src/properties/properties.service.ts).
    content = (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-content-main font-semibold">{t.listing.tenantForbidden}</p>
      </div>
    );
  } else if (isPublished) {
    content = (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <CheckCircle2 size={40} className="mx-auto text-brand-primary" />
        <p className="text-content-main font-semibold">{t.listing.publishSuccess}</p>
        <Link href="/" className="inline-block mt-2">
          <Button size="sm">{t.listing.backHome}</Button>
        </Link>
      </div>
    );
  } else {
    content = (
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
        <h1 className="text-xl sm:text-2xl font-extrabold text-content-main">
          {step === 'preview' ? t.listing.preview : t.listing.newTitle}
        </h1>

        {step !== 'preview' && (
          <>
            <p className="text-content-muted text-xs font-medium mt-1">
              {step === 'step1' ? t.listing.step1Subtitle : t.listing.step2Subtitle}
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <button type="button" onClick={() => setStep('step1')} className="flex-1 py-1.5">
                <span className="block h-1 rounded-full bg-brand-primary" />
              </button>
              <span className={`h-1 flex-1 rounded-full ${step === 'step2' ? 'bg-brand-primary' : 'bg-stroke-default'}`} />
            </div>
          </>
        )}

        <div className="mt-5 bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-5">
          {step === 'preview' ? (
            draft && <ListingPreview values={draft} photos={draftPhotos} />
          ) : (
            <PropertyForm
              ref={formRef}
              step={step === 'step1' ? 1 : 2}
              initialValues={draft ?? undefined}
              initialPhotos={draftPhotos}
              onNext={() => setStep('step2')}
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
          {step === 'step2' && (
            <Button type="button" variant="outline" onClick={() => setStep('step1')}>
              {t.listing.back}
            </Button>
          )}
          {step === 'preview' && (
            <Button type="button" variant="outline" onClick={() => setStep('step2')}>
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
                {step === 'step1' ? t.listing.next : t.listing.preview}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0">{content}</div>
      <RightRail />
    </div>
  );
}
