import Link from 'next/link';
import { RegisterForm } from '@/features/auth/register-form';

export default function InscriptionPage() {
  return (
    <div className="bg-surface-app flex flex-col justify-start sm:justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 sm:min-h-[calc(100dvh-4rem)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-1.5 sm:mb-3">
          <span className="inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-brand-primary text-white font-bold text-base sm:text-xl shadow-md shadow-brand-primary/20">
            O
          </span>
        </Link>
        <h2 className="text-lg sm:text-2xl font-bold text-content-main tracking-tight">
          Créer un compte Onina
        </h2>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-content-muted">
          Rejoignez la plateforme immobilière à Madagascar
        </p>
      </div>

      <div className="mt-3 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}