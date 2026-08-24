import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Onina - Immobilier à Madagascar',
  description: 'Trouvez votre chez-vous : Achat, vente et location d\'immobiliers à Madagascar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}