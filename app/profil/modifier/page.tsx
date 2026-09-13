'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useUpdateProfile } from '@/features/auth/hooks/use-update-profile';
import { Avatar } from '@/components/ui/avatar';
import { EditableRow } from '@/components/ui/editable-row';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { Button } from '@/components/ui/button';

type FieldKey = 'firstName' | 'lastName' | 'email' | 'address' | 'password';
type FormErrors = Partial<Record<FieldKey | 'currentPassword', string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Chaque champ reste en lecture seule jusqu'à ce que son crayon soit cliqué — comme sur Facebook —
// plutôt que tous les champs en saisie libre d'emblée. Port direct de
// Onina-mobile/src/features/profile/screens/profile-edit-screen.tsx (même structure, mêmes
// règles), demandé explicitement pour que web et mobile se comportent pareil sur cet écran.
export default function ModifierProfilPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const { submit, isLoading, errorMessage } = useUpdateProfile();
  const avatarInputId = useId();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Set<FieldKey>>(new Set());
  const [errors, setErrors] = useState<FormErrors>({});

  // `user` vient du store persisté (localStorage) : sur un chargement de page direct sur cette
  // route, il vaut encore `null` le temps de la réhydratation — initialiser les champs avec
  // `useState(user?.firstName ?? '')` les figerait alors à vide pour le reste de la session (un
  // useState ne se réinitialise pas quand sa valeur de départ change). On les renseigne donc ici,
  // une seule fois dès que la session réhydratée est disponible.
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasHydrated || !user || hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email ?? '');
    setAddress(user.address ?? '');
  }, [hasHydrated, user]);

  function startEditing(field: FieldKey) {
    setEditingFields((prev) => new Set(prev).add(field));
  }

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleChangePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-content-main font-semibold">{t.profile.notLoggedIn}</p>
        <Link href="/connexion" className="inline-block mt-4">
          <Button size="sm">{t.profile.login}</Button>
        </Link>
      </div>
    );
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!firstName.trim()) next.firstName = t.auth.firstNameRequired;
    if (!lastName.trim()) next.lastName = t.auth.lastNameRequired;
    if (email && !EMAIL_REGEX.test(email)) next.email = t.auth.invalidEmail;
    if (editingFields.has('password') && newPassword && newPassword.length < 4) {
      next.password = t.auth.passwordTooShort;
    }
    if (!currentPassword) next.currentPassword = t.profile.currentPasswordRequired;
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).some((key) => nextErrors[key as keyof FormErrors])) return;

    const ok = await submit({
      currentPassword,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      address: address || undefined,
      newPassword: editingFields.has('password') && newPassword ? newPassword : undefined,
      avatar: avatarFile,
    });
    if (ok) router.push('/profil');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-10">
      <Link
        href="/profil"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main mb-4"
      >
        <ArrowLeft size={16} />
        {t.profile.myAccount}
      </Link>

      <h1 className="text-lg font-bold text-brand-secondary-text mb-4">{t.profile.edit}</h1>

      <div className="bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-6 space-y-4">
        <FormErrorBanner message={errorMessage} />

        <form className="space-y-1" onSubmit={handleSubmit}>
          <div className="flex justify-center pb-3">
            <div className="relative">
              <Avatar name={`${firstName} ${lastName}`.trim() || user.fullName} imageUrl={avatarPreviewUrl ?? user.avatarUrl} size={88} />
              <label
                htmlFor={avatarInputId}
                aria-label={t.profile.avatarChange}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-primary border-2 border-surface-card flex items-center justify-center cursor-pointer hover:bg-brand-primary-hover transition"
              >
                <Pencil size={14} className="text-white" />
              </label>
              <input
                id={avatarInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleChangePhoto}
              />
            </div>
          </div>

          <EditableRow
            label={t.auth.firstName}
            value={firstName}
            editing={editingFields.has('firstName')}
            onEdit={() => startEditing('firstName')}
            onChange={(event) => {
              setFirstName(event.target.value);
              clearError('firstName');
            }}
            error={errors.firstName}
            editLabel={t.profile.edit}
          />
          <EditableRow
            label={t.auth.lastName}
            value={lastName}
            editing={editingFields.has('lastName')}
            onEdit={() => startEditing('lastName')}
            onChange={(event) => {
              setLastName(event.target.value);
              clearError('lastName');
            }}
            error={errors.lastName}
            editLabel={t.profile.edit}
          />
          <EditableRow
            label={t.auth.emailOptional}
            value={email}
            editing={editingFields.has('email')}
            onEdit={() => startEditing('email')}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError('email');
            }}
            type="email"
            autoCapitalize="none"
            error={errors.email}
            editLabel={t.profile.edit}
          />
          <EditableRow
            label={t.profile.address}
            value={address}
            editing={editingFields.has('address')}
            onEdit={() => startEditing('address')}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={t.profile.addressPlaceholder}
            editLabel={t.profile.edit}
          />
          <EditableRow
            label={t.profile.password}
            value={newPassword}
            displayValue="••••••••"
            editing={editingFields.has('password')}
            onEdit={() => startEditing('password')}
            onChange={(event) => {
              setNewPassword(event.target.value);
              clearError('password');
            }}
            type="password"
            placeholder={t.profile.newPasswordPlaceholder}
            error={errors.password}
            editLabel={t.profile.edit}
          />

          <div className="py-2.5">
            <span className="block text-xs font-medium text-content-muted">{t.auth.phone}</span>
            <p className="mt-0.5 text-sm text-content-main">{user.phone}</p>
          </div>

          <div className="border-t border-stroke-default pt-3.5 space-y-1">
            <p className="text-[11px] text-content-muted">{t.profile.confirmChangesNote}</p>
            <label className="block text-xs font-medium text-content-main mb-1">{t.profile.currentPassword}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                clearError('currentPassword');
              }}
              className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
                errors.currentPassword ? 'border-danger' : 'border-stroke-default'
              }`}
            />
            {errors.currentPassword && <p className="mt-0.5 text-xs text-danger">{errors.currentPassword}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full mt-3.5">
            {isLoading ? t.profile.saving : t.profile.save}
          </Button>
        </form>
      </div>
    </div>
  );
}
