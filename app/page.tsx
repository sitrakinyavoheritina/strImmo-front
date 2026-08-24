import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Bienvenue sur SeLoger Mada 🇲🇬
      </h1>
      <p className="text-slate-600 mb-6 max-w-md">
        La plateforme immobilière simple et rapide pour trouver votre logement.
      </p>

      <div className="flex gap-4">
        <Link
          href="/connexion"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Se connecter
        </Link>
        <Link
          href="/inscription"
          className="px-4 py-2 bg-slate-200 text-slate-800 font-medium rounded-lg hover:bg-slate-300 transition"
        >
          S'inscrire
        </Link>
      </div>
    </main>
  );
}