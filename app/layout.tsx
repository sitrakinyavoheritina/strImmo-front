import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { QueryProvider } from '@/lib/api/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Onina - Immobilier à Madagascar',
  description: "Trouvez votre chez-vous : Achat, vente et location d'immobiliers à Madagascar.",
  appleWebApp: {
    capable: true,
    title: 'Onina',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-surface-app text-content-main min-h-screen flex flex-col">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}