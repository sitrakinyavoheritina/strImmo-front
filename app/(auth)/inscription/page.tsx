import Link from 'next/link';
import { RegisterForm } from '@/features/auth/register-form';

export default function InscriptionPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md shadow-blue-500/20">
            O
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Créer un compte Onina
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Rejoignez la plateforme immobilière à Madagascar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}