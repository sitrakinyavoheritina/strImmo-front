'use client';

import React from 'react';
import Link from 'next/link';
import { useRegister } from './use-register';

export const RegisterForm: React.FC = () => {
  const {
    form: {
      register,
      formState: { errors },
    },
    showPassword,
    showConfirmPassword,
    isLoading,
    setShowPassword,
    setShowConfirmPassword,
    onSubmit,
  } = useRegister();

  return (
    <div className="bg-surface-card py-8 px-6 shadow-sm border border-stroke-default/80 rounded-2xl sm:px-10">
      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              placeholder="ex: Jean"
              {...register('firstname')}
              className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
                errors.firstname ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            {errors.firstname && (
              <p className="mt-1 text-xs text-red-500">{errors.firstname.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              placeholder="ex: Rakoto"
              {...register('lastname')}
              className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
                errors.lastname ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            {errors.lastname && (
              <p className="mt-1 text-xs text-red-500">{errors.lastname.message}</p>
            )}
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Numéro de téléphone
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-medium">
              +261
            </span>
            <input
              type="tel"
              placeholder="34 00 000 00"
              {...register('phone')}
              className={`w-full pl-14 pr-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
                errors.phone ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Email (Optionnel) */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Adresse email <span className="text-slate-400">(optionnel)</span>
          </label>
          <input
            type="email"
            placeholder="exemple@domaine.mg"
            {...register('email')}
            className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
              errors.email ? 'border-red-500' : 'border-stroke-default'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mot de passe
          </label>
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

        {/* Confirmation Mot de passe */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full px-3 py-2.5 bg-surface-app border rounded-xl text-sm text-content-main placeholder-slate-400 focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition ${
                errors.confirmPassword ? 'border-red-500' : 'border-stroke-default'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              {showConfirmPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-brand-secondary hover:bg-brand-secondary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition disabled:opacity-50"
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      {/* Lien vers connexion */}
      <div className="mt-6 text-center border-t border-slate-100 pt-5">
        <p className="text-xs text-content-muted">
          Vous avez déjà un compte ?{' '}
          <Link
            href="/connexion"
            className="font-semibold text-brand-primary hover:text-blue-700"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};