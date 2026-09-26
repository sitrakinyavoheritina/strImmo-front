'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useProperty } from '@/features/search/hooks/use-property';
import { useUpdateProperty } from '@/features/search/hooks/use-update-property';
import { PropertyForm, type PropertyFormHandle } from '@/features/listings/components/property-form';
import { ListingPreview } from '@/features/listings/components/listing-preview';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import type { PropertyFormValues } from '@/features/search/types/listing.types';

type Step = 'step1' | 'step2' | 'step3' | 'preview';

// Modifier une annonce déjà publiée (propriétaire ou admin uniquement) — exactement la même
// interface à 3 étapes + aperçu que la création (app/annonce/nouvelle/page.tsx), demandé
// explicitement plutôt qu'un formulaire distinct : PropertyForm verrouille lui-même ce qui n'est
// plus modifiable une fois l'annonce publiée (type de bien, photos) via `mode="edit"`. Corriger
// une annonce refusée la repasse automatiquement "en attente" côté serveur (voir
// strImmo/src/properties/properties.service.ts:update), pas la peine de le refaire manuellement.
export default function ModifierAnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const { data: property, isLoading } = useProperty(id);
  const { mutateAsync, isPending } = useUpdateProperty();

  const [step, setStep] = useState<Step>('step1');
  const [draft, setDraft] = useState<PropertyFormValues | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<PropertyFormHandle>(null);

  const isOwner = user?.id === property?.ownerId;

  // Attend `hasHydrated` (session relue depuis localStorage) avant de rediriger — sinon, sur un
  // chargement direct de cette page, `isAuthenticated` vaut encore `false` le temps de la
  // réhydratation et un utilisateur pourtant déjà connecté serait renvoyé à tort vers
  // /connexion (même piège que app/annonce/nouvelle/page.tsx). Idem pour la vérification
  // propriétaire/admin, qui dépend en plus de l'annonce chargée (`property`).
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/connexion');
      return;
    }
    // Propriétaire uniquement : un admin consulte et modère, il ne modifie pas le contenu (le
    // backend refuse aussi, voir strImmo/src/properties/properties.service.ts:update).
    if (!isLoading && property && !isOwner) {
      router.replace(`/annonce/${id}`);
    }
  }, [hasHydrated, isAuthenticated, isLoading, property, isOwner, id, router]);

  // `property` (un `Property` complet) satisfait structurellement `PropertyFormValues` (sous-
  // ensemble de `Property`, voir listing.types.ts) — pas de mapping à écrire, une seule
  // initialisation dès que l'annonce est chargée (comme app/profil/modifier/page.tsx pour la même
  // raison : un `useState` ne se réinitialise pas si sa valeur de départ change).
  const hasInitializedDraftRef = useRef(false);
  useEffect(() => {
    if (property && !hasInitializedDraftRef.current) {
      hasInitializedDraftRef.current = true;
      setDraft(property);
    }
  }, [property]);

  async function handleSave() {
    if (!draft || !property) return;
    setErrorMessage(null);
    try {
      await mutateAsync({ id: property.id, values: draft });
      router.push(`/annonce/${property.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  if (!hasHydrated || !isAuthenticated) return null;

  if (isLoading || !draft || !property) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-content-muted">{t.search.searching}</p>
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      <Link
        href={`/annonce/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-3"
      >
        <ArrowLeft size={16} />
        {t.propertyDetail.back}
      </Link>

      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary-text">
        {step === 'preview' ? t.listing.preview : t.listing.editListingTitle}
      </h1>
      {property.moderationStatus === 'rejected' && (
        <p className="text-[0.85rem] text-content-muted mt-1">{t.listing.editRejectedNotice}</p>
      )}

      {step !== 'preview' && (
        <>
          <p className="text-content-muted text-[0.85rem] font-medium mt-1">
            {step === 'step1' ? t.listing.step1Subtitle : step === 'step2' ? t.listing.step2Subtitle : t.listing.step3Subtitle}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5">
            <button type="button" onClick={() => setStep('step1')} className="flex-1 py-1.5">
              <span className="block h-1 rounded-full bg-brand-primary" />
            </button>
            <button
              type="button"
              onClick={() => (step === 'step3' ? setStep('step2') : undefined)}
              disabled={step === 'step1'}
              className="flex-1 py-1.5 disabled:cursor-default"
            >
              <span
                className={`block h-1 rounded-full ${step === 'step2' || step === 'step3' ? 'bg-brand-primary' : 'bg-stroke-default'}`}
              />
            </button>
            <span className={`h-1 flex-1 rounded-full ${step === 'step3' ? 'bg-brand-primary' : 'bg-stroke-default'}`} />
          </div>
        </>
      )}

      <div className="mt-5 bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-5">
        {step === 'preview' ? (
          <ListingPreview values={draft} photos={[]} />
        ) : (
          <PropertyForm
            ref={formRef}
            step={step === 'step1' ? 1 : step === 'step2' ? 2 : 3}
            initialValues={draft}
            mode="edit"
            onNext={() => setStep(step === 'step1' ? 'step2' : 'step3')}
            onPreview={(values) => {
              setDraft(values);
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
            <Button type="button" className="w-full" disabled={isPending} onClick={handleSave}>
              {isPending ? t.listing.saving : t.listing.saveChanges}
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
