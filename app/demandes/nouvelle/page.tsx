'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import translations from '@/lib/i18n/translations';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { Chip, FieldLabel, FormInput } from '@/components/ui/form-controls';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { FilterFields, PROPERTY_TYPES } from '@/features/search/components/filter-fields';
import { useCommunes } from '@/features/listings/hooks/use-communes';
import { useFokontany } from '@/features/listings/hooks/use-fokontany';
import { chatApi } from '@/features/search/services/chat-api';
import { useCreatePropertyRequest } from '@/features/property-requests/hooks/use-property-requests';
import { requestSentence } from '@/features/property-requests/utils/request-summary';
import type { ListingKind, PropertyFilters, PropertyType } from '@/features/search/types/listing.types';

type Step = 'form' | 'summary';

// Décrire en une phrase à l'assistant IA est temporairement masqué (demandé explicitement, "pour
// le moment") — le code reste en place pour le réactiver d'un coup en repassant ce drapeau à true,
// plutôt que de le supprimer et devoir tout réécrire plus tard.
const AI_MODE_ENABLED = false;

const VALID_KINDS: ListingKind[] = ['sale', 'rent'];
const VALID_PROPERTY_TYPES: PropertyType[] = ['house', 'apartment', 'villa', 'land'];

// Création d'une demande (recherche enregistrée) — voir strImmo/src/property-requests/. Le type de
// transaction, le quartier et le budget maximum sont obligatoires (voir CreatePropertyRequestDto) :
// une demande trop vague ne serait pas assez précise pour être comparée utilement à une nouvelle
// annonce (voir matchAndNotify). Les critères "Plus de critères" réutilisent tel quel le composant
// des filtres de recherche avancés de l'accueil (FilterFields, mode="compact") — mêmes champs,
// mêmes noms, pour ne pas dupliquer cette longue liste dans un second composant.
function NouvelleDemandeForm() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const { data: communes } = useCommunes();
  const { mutateAsync: createRequest, isPending: isCreating } = useCreatePropertyRequest();

  // Préremplissage depuis "Aucun résultat" (voir app/recherche/page.tsx, noResultsCtaHref) : reprend
  // ce que la personne cherchait déjà plutôt que de lui faire tout ressaisir. Lu une seule fois au
  // montage (lazy initializer) — un changement d'URL ultérieur ne doit pas écraser ce que la
  // personne a déjà modifié dans le formulaire.
  const searchParams = useSearchParams();

  // Accessible sans être connecté (le bouton "Créer une demande" de "Aucun résultat" reste visible
  // pour tout le monde) — mais publier une demande exige un compte : `next` reporte les critères
  // déjà choisis (voir ci-dessous) jusqu'après la connexion plutôt que les perdre en route (voir
  // useLogin/useGoogleAuth, qui redirigent vers ce `next` une fois connecté).
  useEffect(() => {
    if (!hasHydrated || isAuthenticated) return;
    const query = searchParams.toString();
    router.replace(`/connexion?next=${encodeURIComponent(query ? `${pathname}?${query}` : pathname)}`);
  }, [hasHydrated, isAuthenticated, router, pathname, searchParams]);

  const [step, setStep] = useState<Step>('form');
  const [kind, setKind] = useState<ListingKind | undefined>(() => {
    const value = searchParams.get('kind');
    return value && VALID_KINDS.includes(value as ListingKind) ? (value as ListingKind) : 'rent';
  });
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>(() => {
    const value = searchParams.get('propertyType');
    return value && VALID_PROPERTY_TYPES.includes(value as PropertyType) ? (value as PropertyType) : undefined;
  });
  const [communeId, setCommuneId] = useState<string | undefined>(() => searchParams.get('communeId') ?? undefined);
  const [fokontanyId, setFokontanyId] = useState<string | undefined>();
  const { data: fokontanyList } = useFokontany(communeId);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState(() => searchParams.get('maxBudget') ?? '');
  const [rawDescription, setRawDescription] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(false);

  // Critères facultatifs supplémentaires ("Plus de critères") — mêmes champs que la recherche
  // avancée de l'accueil (voir SidebarAdvancedFilters), réinitialisés à chaque changement de type
  // de bien (`handleSelectPropertyType`) puisqu'aucun ne survit à un changement de type (même
  // règle que useHomeSearchFiltersStore.selectPropertyType).
  const [advancedCriteria, setAdvancedCriteria] = useState<Partial<PropertyFilters>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [isAiMode, setIsAiMode] = useState(false);
  const [aiText, setAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [continueError, setContinueError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function handleSelectPropertyType(value: PropertyType | undefined) {
    setPropertyType(value);
    setAdvancedCriteria({});
  }

  function handleAdvancedUpdate<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setAdvancedCriteria((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAiAnalyze() {
    // Gardé pour AI_MODE_ENABLED, voir le commentaire en tête de fichier — jamais atteignable tant
    // que le bouton qui bascule `isAiMode` reste masqué.
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
      setRawDescription(text);
      setIsAiMode(false);
    } catch (error) {
      setAiError(getErrorMessage(error, t.propertyRequestsPage.aiError));
    } finally {
      setIsAiLoading(false);
    }
  }

  const canContinue = !!kind && !!communeId && !!fokontanyId && !!maxBudget;

  // Bouton volontairement TOUJOURS cliquable (pas `disabled`) : sur un bouton désactivé, le clic
  // ne déclenche rien du tout (aucun événement), donc personne ne voit jamais pourquoi rien ne se
  // passe — remonté explicitement par l'utilisateur. Le message combine français ET malgache dans
  // le même message (pas seulement la langue actuellement choisie, voir le sélecteur FR/MG en
  // haut) — demandé explicitement pour ce message précis.
  function handleContinue() {
    if (!canContinue) {
      setContinueError(
        `${translations.fr.propertyRequestsPage.requiredFields} / ${translations.mg.propertyRequestsPage.requiredFields}`
      );
      return;
    }
    setContinueError(null);
    setStep('summary');
  }

  async function handleSubmit() {
    if (!kind || !communeId || !fokontanyId || !maxBudget) return;
    setSubmitError(null);
    try {
      await createRequest({
        ...advancedCriteria,
        kind,
        propertyType,
        communeId,
        fokontanyId,
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: Number(maxBudget),
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
  const filterDraft: PropertyFilters = { ...advancedCriteria, propertyType };

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
            {AI_MODE_ENABLED && (
              <button
                type="button"
                onClick={() => setIsAiMode((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-brand-primary hover:underline"
              >
                {isAiMode ? t.propertyRequestsPage.manualMode : t.propertyRequestsPage.aiMode}
              </button>
            )}

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
                    <Chip active={!propertyType} onClick={() => handleSelectPropertyType(undefined)}>
                      {t.propertyRequestsPage.propertyTypeAny}
                    </Chip>
                    {PROPERTY_TYPES.map(({ value, labelKey }) => (
                      <Chip key={value} active={propertyType === value} onClick={() => handleSelectPropertyType(value)}>
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

                <FilterFields
                  mode="compact"
                  draft={filterDraft}
                  onUpdate={handleAdvancedUpdate}
                  onSelectPropertyType={handleSelectPropertyType}
                  isAdvancedOpen={isAdvancedOpen}
                  onToggleAdvanced={() => setIsAdvancedOpen((v) => !v)}
                  feeTogglesPlacement="insideAdvanced"
                />

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

      {step === 'form' && !isAiMode && !canContinue && continueError && (
        <div className="mt-2">
          <FormErrorBanner message={continueError} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        {step === 'summary' && (
          <Button type="button" variant="outline" onClick={() => setStep('form')}>
            {t.listing.back}
          </Button>
        )}
        <div className="flex-1">
          {step === 'form' ? (
            <Button type="button" className="w-full" onClick={handleContinue}>
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

export default function NouvelleDemandePage() {
  return (
    <Suspense fallback={null}>
      <NouvelleDemandeForm />
    </Suspense>
  );
}
