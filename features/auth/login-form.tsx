'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from './schemas';

export const LoginForm: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      method: 'phone',
      identifier: '',
      password: '',
    },
  });

  const handleMethodChange = (method: 'phone' | 'email') => {
    setAuthMethod(method);
    setValue('method', method);
    clearErrors();
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    console.log('Données soumises pour Onina :', data);
    // TODO: Appel API réel avec le service d'authentification
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-surface-card py-8 px-6 shadow-sm border border-stroke-default/80 rounded-2xl sm:px-10">
      {/* Bascule Téléphone / Email */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => handleMethodChange('phone')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authMethod === 'phone'
              ? 'bg-surface-card text-content-main shadow-sm'
              : 'text-content-muted hover:text-slate-700'
          }`}
        >
          Téléphone
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('email')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authMethod === 'email'
              ? 'bg-surface-card text-content-main shadow-sm'
              : 'text-content-muted hover:text-slate-700'
          }`}
        >
          Email
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Identifiant */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {authMethod === 'phone' ? 'Numéro de téléphone' : 'Adresse email'}
          </label>
          <div className="relative">
            {authMethod === 'phone' && (
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-medium">
                +261
              </span>
            )}
            <input
              type={authMethod === 'phone' ? 'tel' : 'email'}
              placeholder={authMethod === 'phone' ? '34 00 000 00' : 'exemple@domaine.mg'}
              {...register('identifier')}
              className={`w-full py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
                authMethod === 'phone' ? 'pl-14 pr-3' : 'px-3'
              } ${errors.identifier ? 'border-red-500' : 'border-stroke-default'}`}
            />
          </div>
          {errors.identifier && (
            <p className="mt-1 text-xs text-red-500">{errors.identifier.message}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-primary hover:text-blue-700"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
                errors.password ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-brand-secondary hover:bg-brand-secondary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition disabled:opacity-50"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      {/* Lien vers inscription */}
      <div className="mt-6 text-center border-t border-slate-100 pt-5">
        <p className="text-xs text-content-muted">
          Vous n'avez pas encore de compte ?{' '}
          <Link href="/inscription" className="font-semibold text-brand-primary hover:text-blue-700">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};