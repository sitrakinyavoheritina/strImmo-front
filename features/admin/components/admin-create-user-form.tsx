'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { Chip, FieldLabel, FormInput, Toggle } from '@/components/ui/form-controls';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { useCreateAdminUser } from '../hooks/use-create-admin-user';
import type { CreateUserAsAdminResponse } from '../types';

type Role = 'owner' | 'tenant' | 'agency';

// Formulaire de /admin/utilisateurs/nouveau — owner/tenant/agency (voir CreateUserAsAdminDto :
// `agent` reste hors de ce formulaire, seul rôle à exiger une pièce d'identité). "Anonyme" vide
// et désactive les champs nom/prénom (le pseudo est généré côté serveur, voir
// AuthService.createUserAsAdmin) plutôt que de les laisser visibles mais ignorés, pour ne pas
// laisser croire qu'ils comptent — option absente pour une agence (son identité EST son nom
// commercial, jamais anonyme).
export function AdminCreateUserForm({ onCreated }: { onCreated: (result: CreateUserAsAdminResponse) => void }) {
  const { t } = useTranslation();
  const { mutate: createUser, isPending, error } = useCreateAdminUser();

  const [role, setRole] = useState<Role>('owner');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [address, setAddress] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAgency = role === 'agency';

  function handleRoleChange(nextRole: Role) {
    setRole(nextRole);
    if (nextRole === 'agency') setIsAnonymous(false);
  }

  function handleSubmit() {
    if (!phone.trim() && !email.trim()) {
      setValidationError(t.adminCreateUserPage.contactHint);
      return;
    }
    if (isAgency && (!agencyName.trim() || !address.trim())) {
      setValidationError(t.adminCreateUserPage.agencyFieldsRequired);
      return;
    }
    setValidationError(null);
    createUser(
      {
        role,
        isAnonymous: isAgency ? false : isAnonymous,
        firstName: isAnonymous ? undefined : firstName.trim() || undefined,
        lastName: isAnonymous ? undefined : lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        agencyName: isAgency ? agencyName.trim() : undefined,
        address: isAgency ? address.trim() : undefined,
      },
      { onSuccess: onCreated },
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{t.adminCreateUserPage.roleLabel}</FieldLabel>
        <div className="flex gap-1.5">
          <Chip active={role === 'owner'} onClick={() => handleRoleChange('owner')}>
            {t.auth.roleOwner}
          </Chip>
          <Chip active={role === 'tenant'} onClick={() => handleRoleChange('tenant')}>
            {t.auth.roleTenant}
          </Chip>
          <Chip active={role === 'agency'} onClick={() => handleRoleChange('agency')}>
            {t.auth.roleAgency}
          </Chip>
        </div>
      </div>

      {isAgency ? (
        <>
          <FormInput label={t.auth.agencyName} value={agencyName} onChange={setAgencyName} placeholder={t.auth.agencyNamePlaceholder} />
          <FormInput label={t.auth.address} value={address} onChange={setAddress} placeholder={t.auth.addressPlaceholder} />
          <p className="text-[0.85rem] text-content-muted">{t.adminCreateUserPage.agencyResponsibleHint}</p>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label={t.adminCreateUserPage.firstNameLabel} value={firstName} onChange={setFirstName} />
            <FormInput label={t.adminCreateUserPage.lastNameLabel} value={lastName} onChange={setLastName} />
          </div>
        </>
      ) : (
        <>
          <div>
            <Toggle label={t.adminCreateUserPage.anonymousLabel} checked={isAnonymous} onChange={setIsAnonymous} />
            {isAnonymous && <p className="text-[0.85rem] text-content-muted mt-1.5">{t.adminCreateUserPage.anonymousHint}</p>}
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-2 gap-3">
              <FormInput label={t.adminCreateUserPage.firstNameLabel} value={firstName} onChange={setFirstName} />
              <FormInput label={t.adminCreateUserPage.lastNameLabel} value={lastName} onChange={setLastName} />
            </div>
          )}
        </>
      )}

      <FormInput label={t.adminCreateUserPage.phoneLabel} value={phone} onChange={setPhone} />
      <FormInput label={t.adminCreateUserPage.emailLabel} value={email} onChange={setEmail} />
      <p className="text-[0.85rem] text-content-muted">{t.adminCreateUserPage.contactHint}</p>

      <FormErrorBanner message={validationError ?? (error ? getErrorMessage(error, t.adminCreateUserPage.createError) : null)} />

      <Button type="button" className="w-full" disabled={isPending} onClick={handleSubmit}>
        {isPending ? t.adminCreateUserPage.submitting : t.adminCreateUserPage.submit}
      </Button>
    </div>
  );
}
