'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { Button } from '@/components/ui/button';
import { useLogin } from './hooks/use-login';

// Le bascule Téléphone/Email n'affecte que le clavier/placeholder attendu — `identifier` est
// toujours le seul champ envoyé au backend (voir schemas.ts et strImmo/src/auth/dto/login.dto.ts).
export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const { form, isLoading, errorMessage, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="bg-surface-card py-4 px-4 sm:py-8 sm:px-10 shadow-sm border border-stroke-default/80 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
      <FormErrorBanner message={errorMessage} />

      <div className="flex bg-surface-app p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setAuthMethod('phone')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authMethod === 'phone' ? 'bg-surface-card text-content-main shadow-sm' : 'text-content-muted hover:text-content-main'
          }`}
        >
          {t.auth.tabPhone}
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('email')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authMethod === 'email' ? 'bg-surface-card text-content-main shadow-sm' : 'text-content-muted hover:text-content-main'
          }`}
        >
          {t.auth.tabEmail}
        </button>
      </div>

      <form className="space-y-3 sm:space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">
            {authMethod === 'phone' ? t.auth.phone : t.auth.email}
          </label>
          <input
            type={authMethod === 'phone' ? 'tel' : 'email'}
            placeholder={authMethod === 'phone' ? t.auth.phonePlaceholder : t.auth.emailPlaceholder}
            {...register('identifier')}
            className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
              errors.identifier ? 'border-red-500' : 'border-stroke-default'
            }`}
          />
          {errors.identifier && <p className="mt-0.5 text-xs text-danger">{errors.identifier.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">{t.auth.password}</label>
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-content-muted hover:text-content-main font-medium"
            >
              {showPassword ? t.auth.hide : t.auth.show}
            </button>
          </div>
          {errors.password && <p className="mt-0.5 text-xs text-danger">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading} variant="secondary" className="w-full">
          {isLoading ? t.auth.loggingIn : t.auth.login}
        </Button>
      </form>

      <div className="text-center border-t border-stroke-default pt-3 sm:pt-5">
        <p className="text-xs text-content-muted">
          {t.auth.noAccount}{' '}
          <Link href="/inscription" className="font-semibold text-brand-primary hover:text-brand-primary-hover">
            {t.auth.createAccount}
          </Link>
        </p>
      </div>
    </div>
  );
};
