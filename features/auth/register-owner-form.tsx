'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { Button } from '@/components/ui/button';
import { ownerTenantSchema, OwnerTenantFormData } from './schemas';
import { useRegisterSubmit } from './hooks/use-register';

// Owner et tenant partagent exactement le même formulaire (seul `role` diffère à l'envoi) — même
// principe que Onina-mobile/src/features/auth/screens/register-screen.tsx.
export const RegisterOwnerForm: React.FC<{ role: 'owner' | 'tenant' }> = ({ role }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { submit, isLoading, errorMessage } = useRegisterSubmit();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerTenantFormData>({
    resolver: zodResolver(ownerTenantSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit((data) => submit({ ...data, role }));

  return (
    <div className="bg-surface-card py-4 px-4 sm:py-8 sm:px-10 shadow-sm border border-stroke-default/80 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
      <FormErrorBanner message={errorMessage} />

      <form className="space-y-2.5 sm:space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.firstName}</label>
            <input
              type="text"
              placeholder={t.auth.firstNamePlaceholder}
              {...register('firstName')}
              className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
                errors.firstName ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            {errors.firstName && <p className="mt-0.5 text-[0.85rem] text-danger">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.lastName}</label>
            <input
              type="text"
              placeholder={t.auth.lastNamePlaceholder}
              {...register('lastName')}
              className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
                errors.lastName ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            {errors.lastName && <p className="mt-0.5 text-[0.85rem] text-danger">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.phone}</label>
          <input
            type="tel"
            placeholder={t.auth.phonePlaceholder}
            {...register('phone')}
            className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
              errors.phone ? 'border-red-500' : 'border-stroke-default'
            }`}
          />
          {errors.phone && <p className="mt-0.5 text-[0.85rem] text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.emailOptional}</label>
          <input
            type="email"
            placeholder={t.auth.emailPlaceholder}
            {...register('email')}
            className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
              errors.email ? 'border-red-500' : 'border-stroke-default'
            }`}
          />
          {errors.email && <p className="mt-0.5 text-[0.85rem] text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.password}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
                errors.password ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[0.85rem] text-content-muted hover:text-content-main font-medium"
            >
              {showPassword ? t.auth.hide : t.auth.show}
            </button>
          </div>
          {errors.password && <p className="mt-0.5 text-[0.85rem] text-danger">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading} variant="secondary" className="w-full mt-1 sm:mt-2">
          {isLoading ? t.auth.registering : t.auth.register}
        </Button>
      </form>

      <div className="text-center border-t border-stroke-default pt-3 sm:pt-5 space-y-1.5">
        <p className="text-[0.85rem] text-content-muted">
          {t.auth.hasAccount}{' '}
          <Link href="/connexion" className="font-semibold text-brand-primary hover:text-brand-primary-hover">
            {t.auth.login}
          </Link>
        </p>
        <p className="text-[0.85rem]">
          <Link href="/inscription" className="font-semibold text-content-muted hover:text-content-main">
            {t.auth.backToRoleSelect}
          </Link>
        </p>
      </div>
    </div>
  );
};
