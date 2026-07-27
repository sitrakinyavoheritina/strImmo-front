'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { Button } from '@/components/ui/button';
import { useLogin } from './hooks/use-login';
import { GoogleSignInButton } from './components/google-sign-in-button';

// Un seul champ pour le téléphone OU l'email (plus de bascule Téléphone/Email) — `identifier` est
// envoyé tel quel au backend, qui reconnaît lui-même lequel c'est (voir schemas.ts et
// strImmo/src/auth/dto/login.dto.ts).
export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { form, isLoading, errorMessage, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="bg-surface-card py-4 px-4 sm:py-8 sm:px-10 shadow-sm border border-stroke-default/80 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
      <FormErrorBanner message={errorMessage} />

      <form className="space-y-3 sm:space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">
            {t.auth.identifier}
          </label>
          <input
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder={t.auth.identifierPlaceholder}
            {...register('identifier')}
            className={`w-full px-3 py-2 sm:py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition ${
              errors.identifier ? 'border-red-500' : 'border-stroke-default'
            }`}
          />
          {errors.identifier && <p className="mt-0.5 text-xs text-danger">{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <label className="text-xs font-medium text-content-main">{t.auth.password}</label>
            <Link href="/mot-de-passe-oublie" className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover">
              {t.auth.forgotPassword}
            </Link>
          </div>
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

      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-stroke-default" />
        <span className="text-[11px] font-medium text-content-muted uppercase">{t.auth.orDivider}</span>
        <span className="flex-1 h-px bg-stroke-default" />
      </div>

      <GoogleSignInButton />

      <div className="text-center border-t border-stroke-default pt-3 sm:pt-5 space-y-2">
        <p className="text-xs text-content-muted">{t.auth.noAccount}</p>
        <Link
          href="/inscription"
          className="block w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-surface-app hover:bg-stroke-default border border-stroke-default text-content-main transition active:scale-[0.98]"
        >
          {t.auth.signUp}
        </Link>
      </div>
    </div>
  );
};
