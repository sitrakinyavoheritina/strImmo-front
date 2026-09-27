'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { Chip, FieldLabel, FormInput } from '@/components/ui/form-controls';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { PROPERTY_TYPES } from '@/features/search/components/filter-fields';
import { useCommunes } from '@/features/listings/hooks/use-communes';
import { useFokontany } from '@/features/listings/hooks/use-fokontany';
import { chatApi } from '@/features/search/services/chat-api';
import { useCreatePropertyRequest } from '@/features/property-requests/hooks/use-property-requests';
import { requestSentence } from '@/features/property-requests/utils/request-summary';
import type { ListingKind, PropertyType } from '@/features/search/types/listing.types';

type Step = 'form' | 'summary';

// Création d'une demande (recherche enregistrée) — voir strImmo/src/property-requests/. Deux
// façons de remplir les critères : le formulaire ci-dessous, ou décrire en une phrase à
// l'assistant IA (réutilise POST /chat, déjà utilisé pour la recherche classique) qui préremplit
// les mêmes champs. Les deux aboutissent au même écran de résumé avant création.
export default function NouvelleDemandePage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const { data: communes } = useCommunes();
  const { mutateAsync: createRequest, isPending: isCreating } = useCreatePropertyRequest();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  const [step, setStep] = useState<Step>('form');
  const [kind, setKind] = useState<ListingKind | undefined>('rent');
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>();
  const [communeId, setCommuneId] = useState<string | undefined>();
  const [fokontanyId, setFokontanyId] = useState<string | undefined>();
  const { data: fokontanyList } = useFokontany(communeId);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [rawDescription, setRawDescription] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(false);

  const [isAiMode, setIsAiMode] = useState(false);
  const [aiText, setAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  async function handleAiAnalyze() {
    const text = aiText.trim();
    if (!text || isAiLoading) return;
    setAiError(null);
    setIsAiLoading(true);
    try {
      const { filters } = await chatApi.sendMessage([{ role: 'user', content: text }]);
      if (!filters) {
        setAiError(t.propertyRequestsPage.aiError);
        return;
      }
      if (filters.kind) setKind(filters.kind);
      if (filters.propertyType) setPropertyType(filters.propertyType);
      if (filters.communeId) {
        setCommuneId(filters.communeId);
        // L'assistant ne renvoie jamais de quartier précis — un ancien choix ne correspondrait
        // plus forcément à cette nouvelle commune (même règle que le changement manuel ci-dessous).
        setFokontanyId(undefined);
      }
      if (filters.minPrice != null) setMinBudget(String(filters.minPrice));
      if (filters.maxPrice != null) setMaxBudget(String(filters.maxPrice));
      if (filters.minBedrooms != null) setMinBedrooms(String(filters.minBedrooms));
      setRawDescription(text);
      setIsAiMode(false);
    } catch (error) {
      setAiError(getErrorMessage(error, t.propertyRequestsPage.aiError));
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleContinue() {
    if (!kind) return;
    setStep('summary');
  }

  async function handleSubmit() {
    if (!kind) return;
    setSubmitError(null);
    try {
      await createRequest({
        kind,
        propertyType,
        communeId,
        fokontanyId,
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
        // Sans objet pour un terrain (voir le champ masqué plus bas) — jamais envoyé dans ce cas,
        // même si une valeur traîne encore dans le brouillon après un changement de type.
        minBedrooms: propertyType !== 'land' && minBedrooms ? Number(minBedrooms) : undefined,
        rawDescription,
        isPublic,
      });
      setCreated(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error, t.propertyRequestsPage.submitError));
    }
  }

  if (!isAuthenticated) return null;

  const communeName = communes?.find((c) => c.id === communeId)?.name;
  const fokontanyName = fokontanyList?.find((f) => f.id === fokontanyId)?.name;

  if (created) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-content-main font-semibold">{t.propertyRequestsPage.createdTitle}</p>
        <p className="text-sm text-content-muted">{t.propertyRequestsPage.createdText}</p>
        <Button type="button" className="mt-2" onClick={() => router.push('/demandes')}>
          {t.propertyRequestsPage.viewMySearches}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary-text">
        {step === 'form' ? t.propertyRequestsPage.newTitle : t.propertyRequestsPage.summaryTitle}
      </h1>
      {step === 'form' && <p className="text-content-muted text-[0.85rem] font-medium mt-1">{t.propertyRequestsPage.newSubtitle}</p>}

      <div className="mt-5 bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-5 space-y-4">
        {step === 'form' ? (
          <>
            <button
              type="button"
              onClick={() => setIsAiMode((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-brand-primary hover:underline"
            >
              <Sparkles size={14} />
              {isAiMode ? t.propertyRequestsPage.manualMode : t.propertyRequestsPage.aiMode}
            </button>

            {isAiMode ? (
              <div className="space-y-2">
                <textarea
                  value={aiText}
                  onChange={(event) => setAiText(event.target.value)}
                  placeholder={t.propertyRequestsPage.aiPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none"
                />
                <FormErrorBanner message={aiError} />
                <Button type="button" disabled={!aiText.trim() || isAiLoading} onClick={handleAiAnalyze}>
                  {isAiLoading ? t.propertyRequestsPage.aiAnalyzing : t.propertyRequestsPage.aiSend}
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <FieldLabel>{t.propertyRequestsPage.kindLabel}</FieldLabel>
                  <div className="flex rounded-xl border border-stroke-default overflow-hidden w-fit">
                    <button
                      type="button"
                      onClick={() => setKind('rent')}
                      className={`px-4 py-2 text-sm font-semibold transition ${kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'}`}
                    >
                      {t.search.rent}
                    </button>
                    <button
                      type="button"
                      onClick={() => setKind('sale')}
                      className={`px-4 py-2 text-sm font-semibold transition border-l border-stroke-default ${kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'}`}
                    >
                      {t.search.buy}
                    </button>
                  </div>
                </div>

                <div>
                  <FieldLabel>{t.propertyRequestsPage.propertyTypeLabel}</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip active={!propertyType} onClick={() => setPropertyType(undefined)}>
                      {t.propertyRequestsPage.propertyTypeAny}
                    </Chip>
                    {PROPERTY_TYPES.map(({ value, labelKey }) => (
                      <Chip key={value} active={propertyType === value} onClick={() => setPropertyType(value)}>
                        {t.search[labelKey]}
                      </Chip>
                    ))}
                  </div>
                </div>

                <SearchableSelect
                  label={t.propertyRequestsPage.communeLabel}
                  value={communeId}
                  onChange={(id) => {
                    setCommuneId(id);
                    // Un quartier choisi pour l'ancienne commune n'aurait plus de sens pour la
                    // nouvelle (même règle que property-form.tsx:handleCommuneChange).
                    setFokontanyId(undefined);
                  }}
                  options={(communes ?? []).map((commune) => ({ id: commune.id, label: commune.name, sublabel: commune.district }))}
                  placeholder={t.propertyRequestsPage.communePlaceholder}
                  searchPlaceholder={t.listing.communeSearchPlaceholder}
                  emptyMessage={t.listing.communeEmptyMessage}
                />

                {/* Facultatif, choisi après la commune (désactivé tant qu'elle n'est pas encore
                    choisie) — même parcours que la localisation précise d'une annonce, voir
                    property-form.tsx. */}
                <SearchableSelect
                  label={t.propertyRequestsPage.fokontanyLabel}
                  value={fokontanyId}
                  onChange={setFokontanyId}
                  options={(fokontanyList ?? []).map((fokontany) => ({ id: fokontany.id, label: fokontany.name }))}
                  placeholder={communeId ? t.propertyRequestsPage.fokontanyPlaceholder : t.listing.formFokontanyDisabledPlaceholder}
                  searchPlaceholder={t.listing.fokontanySearchPlaceholder}
                  emptyMessage={t.listing.fokontanyEmptyMessage}
                  disabled={!communeId}
                />

                <div>
                  <FieldLabel>{t.propertyRequestsPage.budgetLabel}</FieldLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label=""
                      value={minBudget}
                      onChange={(v) => setMinBudget(v.replace(/\D/g, ''))}
                      placeholder={t.propertyRequestsPage.budgetMinPlaceholder}
                      type="number"
                      suffix="Ar"
                    />
                    <FormInput
                      label=""
                      value={maxBudget}
                      onChange={(v) => setMaxBudget(v.replace(/\D/g, ''))}
                      placeholder={t.propertyRequestsPage.budgetMaxPlaceholder}
                      type="number"
                      suffix="Ar"
                    />
                  </div>
                </div>

                {/* Un terrain n'a pas de chambres — champ masqué pour ce type, comme dans le
                    formulaire de publication d'une annonce (voir property-form.tsx). */}
                {propertyType !== 'land' && (
                  <FormInput
                    label={t.propertyRequestsPage.minBedroomsLabel}
                    value={minBedrooms}
                    onChange={(v) => setMinBedrooms(v.replace(/\D/g, ''))}
                    placeholder="0"
                    type="number"
                  />
                )}

                <div>
                  <FieldLabel>{t.propertyRequestsPage.detailsLabel}</FieldLabel>
                  <textarea
                    value={rawDescription ?? ''}
                    onChange={(event) => setRawDescription(event.target.value || undefined)}
                    placeholder={t.propertyRequestsPage.detailsPlaceholder}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="rounded-xl bg-surface-app p-3 text-sm text-content-main whitespace-pre-line">
              {requestSentence(
                {
                  kind: kind ?? 'rent',
                  propertyType,
                  communeName,
                  fokontanyName,
                  minBudget: minBudget ? Number(minBudget) : undefined,
                  maxBudget: maxBudget ? Number(maxBudget) : undefined,
                  rawDescription,
                },
                locale
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-primary shrink-0"
              />
              <span className="text-sm text-content-main">
                <span className="font-semibold">{t.propertyRequestsPage.visibilityLabel}</span>
                <span className="block text-[0.85rem] text-content-muted mt-0.5">{t.propertyRequestsPage.visibilityHint}</span>
              </span>
            </label>

            <FormErrorBanner message={submitError} />
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {step === 'summary' && (
          <Button type="button" variant="outline" onClick={() => setStep('form')}>
            {t.listing.back}
          </Button>
        )}
        <div className="flex-1">
          {step === 'form' ? (
            <Button type="button" className="w-full" disabled={!kind} onClick={handleContinue}>
              {t.propertyRequestsPage.next}
            </Button>
          ) : (
            <Button type="button" className="w-full" disabled={isCreating} onClick={handleSubmit}>
              {isCreating ? t.propertyRequestsPage.submitting : t.propertyRequestsPage.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
