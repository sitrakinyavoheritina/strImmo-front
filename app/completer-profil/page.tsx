'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { FieldLabel, FormInput, Chip } from '@/components/ui/form-controls';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';

type Role = 'owner' | 'tenant' | 'agent' | 'agency';
type FormErrors = Partial<Record<'phone' | 'agencyName' | 'address', string>>;

const ROLES: { value: Role; icon: typeof Home; titleKey: 'roleOwner' | 'roleTenant' | 'roleAgentChoice' | 'roleAgency' }[] = [
  { value: 'owner', icon: Home, titleKey: 'roleOwner' },
  { value: 'tenant', icon: Key, titleKey: 'roleTenant' },
  { value: 'agent', icon: Handshake, titleKey: 'roleAgentChoice' },
  { value: 'agency', icon: Building2, titleKey: 'roleAgency' },
];

// Dernière étape après "Se connecter avec Google" pour un compte fraîchement créé (voir
// use-google-auth.ts, redirigé ici dès que `user.phone` est absent — Google ne le fournit
// jamais). Un seul rôle par défaut ("owner", choisi à la création côté serveur) à confirmer ou
// changer, puis les champs obligatoires du rôle choisi — mêmes champs que les formulaires
// d'inscription classiques, sans mot de passe (déjà généré côté serveur pour ce compte).
export default function CompleterProfilPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const hasHydrated = useAuthHasHydrated();

  const [role, setRole] = useState<Role>('owner');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [address, setAddress] = useState('');
  const [cinRecto, setCinRecto] = useState<File | null>(null);
  const [cinVerso, setCinVerso] = useState<File | null>(null);
  const [nifStat, setNifStat] = useState<NifStatValue>(EMPTY_NIF_STAT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rien à faire ici pour un compte déjà complet (téléphone déjà renseigné) ou pas connecté —
  // même garde par `useEffect` + `hasHydrated` que les autres pages authentifiées (voir
  // app/profil/modifier/page.tsx), pour ne pas rediriger à tort le temps de la réhydratation.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/connexion');
      return;
    }
    if (user?.phone) {
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || !user || user.phone) return null;

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!phone.trim()) next.phone = t.auth.phoneRequired;
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
        phone,
        agencyName: role === 'agency' ? agencyName : undefined,
        address: role === 'agency' ? address : undefined,
        cinRecto,
        cinVerso,
        ...(role === 'agency' ? toNifStatPayload(nifStat) : {}),
      });
      setSession(updatedUser, token);
      setStoredTheme(updatedUser.themePreference);
      setStoredFeedDisplay(updatedUser.feedDisplay);
      router.push('/');
    } catch (error) {
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
          <div>
            <FieldLabel>{t.auth.completeProfileRoleLabel}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(({ value, icon: Icon, titleKey }) => (
                <Chip key={value} active={role === value} onClick={() => setRole(value)}>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={13} />
                    {t.auth[titleKey]}
                  </span>
                </Chip>
              ))}
            </div>
          </div>

          <FormInput
            label={t.auth.phone}
            value={phone}
            onChange={(value) => {
              setPhone(value);
              clearError('phone');
            }}
            placeholder={t.auth.phonePlaceholder}
            error={errors.phone}
          />

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
