import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-surface-card/95 backdrop-blur border-b border-stroke-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-brand-primary text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            O
          </span>
          <span className="text-xl font-bold text-content-main tracking-tight">
            Onina<span className="text-brand-primary">.mg</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/recherche?type=location" className="hover:text-brand-primary transition">
            Louer
          </Link>
          <Link href="/recherche?type=vente" className="hover:text-brand-primary transition">
            Acheter
          </Link>
          <Link href="/projets" className="hover:text-brand-primary transition">
            Projets neufs
          </Link>
          <Link href="/agences" className="hover:text-brand-primary transition">
            Agences
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-primary transition"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </header>
  );
};