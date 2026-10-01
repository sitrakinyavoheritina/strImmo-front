'use client';

import { getPhoneNotVerified } from '@/features/auth/utils/phone-not-verified';
import { usePhoneVerificationRedirect } from '@/features/auth/hooks/use-phone-verification-redirect';
import { markWelcomePending } from '@/lib/auth/welcome-flag';
import { getSafeNextPath } from '@/lib/auth/safe-next-path';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Key, Handshake, Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { authService } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { FileInput } from '@/features/auth/components/file-input';
import { EMPTY_NIF_STAT, NifStatFields, toNifStatPayload, type NifStatValue } from '@/features/auth/components/nif-stat-fields';
import { SHOW_CIN_UPLOAD } from '@/features/auth/config';
import { FormInput } from '@/components/ui/form-controls';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';

type Role = 'owner' | 'tenant' | 'agent' | 'agency';
type FormErrors = Partial<Record<'agencyName' | 'address', string>>;

const ROLES: {
  value: Role;
  icon: typeof Home;
  titleKey: 'roleOwnerChoice' | 'roleTenantChoice' | 'roleAgentChoice' | 'roleAgency';
  descKey: 'roleOwnerDescription' | 'roleTenantDescription' | 'roleAgentDescription' | 'roleAgencyDescription';
}[] = [
  { value: 'owner', icon: Home, titleKey: 'roleOwnerChoice', descKey: 'roleOwnerDescription' },
  { value: 'tenant', icon: Key, titleKey: 'roleTenantChoice', descKey: 'roleTenantDescription' },
  { value: 'agent', icon: Handshake, titleKey: 'roleAgentChoice', descKey: 'roleAgentDescription' },
  { value: 'agency', icon: Building2, titleKey: 'roleAgency', descKey: 'roleAgencyDescription' },
];

// Dernière étape après "Se connecter avec Google" pour un compte fraîchement créé (voir
// use-google-auth.ts, redirigé ici tant que `user.hasCompletedProfile` est faux). Un seul rôle
// par défaut ("owner", choisi à la création côté serveur) à confirmer ou changer, puis les champs
// obligatoires du rôle choisi — le numéro de téléphone n'en fait plus partie (demandé
// explicitement : pas de friction juste après "Se connecter avec Google"). Il sera exigé et
// vérifié par OTP plus tard, au moment de publier une annonce ou créer une demande (voir
// strImmo/src/properties/properties.service.ts, property-requests.service.ts).
function CompleterProfilForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const goToVerification = usePhoneVerificationRedirect();
  const hasHydrated = useAuthHasHydrated();
  // Reporté depuis /connexion (voir useGoogleAuth) quand un compte Google flambant neuf devait
  // d'abord passer par ici avant de rejoindre sa destination d'origine (ex. /demandes/nouvelle
  // depuis "Aucun résultat") — sans ça, cette étape intermédiaire perdrait l'intention initiale et
  // renverrait toujours à l'accueil.
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get('next'));

  const [role, setRole] = useState<Role>('owner');
  const [agencyName, setAgencyName] = useState('');
  const [address, setAddress] = useState('');
  const [cinRecto, setCinRecto] = useState<File | null>(null);
  const [cinVerso, setCinVerso] = useState<File | null>(null);
  const [nifStat, setNifStat] = useState<NifStatValue>(EMPTY_NIF_STAT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // `goToVerification()` (voir plus bas) ferme la session Google en cours avant de partir vers
  // l'écran du code — ça fait passer `isAuthenticated` à `false` et déclenchait à tort la garde
  // juste en dessous, qui renvoyait vers /connexion en même temps, écrasant la navigation voulue
  // vers /verification-telephone. Ce drapeau la fait ignorer cette sortie volontaire.
  const leavingForVerification = useRef(false);

  // Rien à faire ici pour un compte déjà complet ou pas connecté — même garde par `useEffect` +
  // `hasHydrated` que les autres pages authentifiées (voir app/profil/modifier/page.tsx), pour ne
  // pas rediriger à tort le temps de la réhydratation.
  useEffect(() => {
    if (!hasHydrated || leavingForVerification.current) return;
    if (!isAuthenticated) {
      router.replace(nextPath ? `/connexion?next=${encodeURIComponent(nextPath)}` : '/connexion');
      return;
    }
    if (user?.hasCompletedProfile) {
      router.replace(nextPath ?? '/');
    }
  }, [hasHydrated, isAuthenticated, user, router, nextPath]);

  if (!hasHydrated || !isAuthenticated || !user || user.hasCompletedProfile) return null;

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (role === 'agency') {
      if (!agencyName.trim()) next.agencyName = t.auth.agencyNameRequired;
      if (!address.trim()) next.address = t.auth.addressRequired;
    }
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).some((key) => nextErrors[key as keyof FormErrors])) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user: updatedUser, token } = await authService.completeProfile({
        role,
        agencyName: role === 'agency' ? agencyName : undefined,
        address: role === 'agency' ? address : undefined,
        cinRecto,
        cinVerso,
        ...(role === 'agency' ? toNifStatPayload(nifStat) : {}),
      });
      setSession(updatedUser, token);
      markWelcomePending(updatedUser.id);
      setStoredTheme(updatedUser.themePreference);
      setStoredFeedDisplay(updatedUser.feedDisplay);
      router.push(nextPath ?? '/');
    } catch (error) {
      // Propriétaire / intermédiaire / agence : le backend a envoyé le code SMS et refuse la session
      // tant que le numéro n'est pas vérifié — on ferme la session Google en cours et on passe à
      // l'écran du code (le compte est bien créé).
      const notVerified = getPhoneNotVerified(error);
      if (notVerified) {
        leavingForVerification.current = true;
        goToVerification(notVerified, true);
        return;
      }
      setErrorMessage(getErrorMessage(error, "Une erreur est survenue."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell title={t.auth.completeProfileTitle} subtitle={t.auth.completeProfileSubtitle}>
      <div className="bg-surface-card py-4 px-4 sm:py-8 sm:px-10 shadow-sm border border-stroke-default/80 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <FormErrorBanner message={errorMessage} />

        <form className="space-y-3.5" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            {ROLES.map(({ value, icon: Icon, titleKey, descKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`w-full flex items-center gap-3 text-left bg-surface-card border rounded-xl sm:rounded-2xl p-4 transition ${
                  role === value
                    ? 'border-brand-primary bg-brand-primary-soft'
                    : 'border-stroke-default/80 hover:border-brand-primary'
                }`}
              >
                <span className="shrink-0 basis-1/5 aspect-square flex items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                  <Icon size={20} />
                </span>
                <span className="min-w-0">
                  <p className="font-semibold text-content-main text-sm">{t.auth[titleKey]}</p>
                  <p className="text-[0.85rem] text-content-muted mt-0.5">{t.auth[descKey]}</p>
                </span>
              </button>
            ))}
          </div>

          {role === 'agent' && SHOW_CIN_UPLOAD && (
            <>
              <FileInput label={t.auth.cinRecto} file={cinRecto} onChange={setCinRecto} />
              <FileInput label={t.auth.cinVerso} file={cinVerso} onChange={setCinVerso} />
            </>
          )}

          {role === 'agency' && (
            <>
              <FormInput
                label={t.auth.agencyName}
                value={agencyName}
                onChange={(value) => {
                  setAgencyName(value);
                  clearError('agencyName');
                }}
                placeholder={t.auth.agencyNamePlaceholder}
                error={errors.agencyName}
              />
              <FormInput
                label={t.auth.address}
                value={address}
                onChange={(value) => {
                  setAddress(value);
                  clearError('address');
                }}
                placeholder={t.auth.addressPlaceholder}
                error={errors.address}
              />
              <NifStatFields value={nifStat} onChange={setNifStat} />
            </>
          )}

          <Button type="submit" disabled={isLoading} variant="secondary" className="w-full mt-1 sm:mt-2">
            {isLoading ? t.auth.completeProfileSubmitting : t.auth.completeProfileSubmit}
          </Button>
        </form>
      </div>
    </AuthPageShell>
  );
}

export default function CompleterProfilPage() {
  return (
    <Suspense fallback={null}>
      <CompleterProfilForm />
    </Suspense>
  );
}
