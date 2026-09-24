import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { QueryProvider } from '@/lib/api/query-provider';
import { Analytics } from '@/components/analytics/analytics';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `template` : les pages qui ne fournissent que leur titre court obtiennent "… | Onina".
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'fr_MG',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION },
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3e8d2' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1410' },
  ],
};

// Appliqué avant l'hydratation React (donc avant que useThemePreference ne s'exécute) pour éviter
// un flash du mauvais thème : sans ça, la page afficherait d'abord le thème clair par défaut
// pendant une fraction de seconde même pour quelqu'un ayant choisi le sombre manuellement, le
// temps que React démarre et lise localStorage. `prefers-color-scheme` seul (sans préférence
// enregistrée) n'a pas besoin de ce script : c'est déjà purement du CSS (voir globals.css).
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var pref = localStorage.getItem('onina_theme');
    if (pref === 'light' || pref === 'dark') {
      document.documentElement.setAttribute('data-theme', pref);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` : le script ci-dessous pose `data-theme` sur cet élément AVANT
    // l'hydratation React, donc le HTML rendu par le serveur (sans cet attribut, puisque
    // localStorage n'existe pas côté serveur) ne correspond plus à ce que le navigateur affiche
    // déjà au moment où React s'hydrate — un mismatch attendu et sans conséquence ici (React ne
    // touche plus jamais cet attribut ensuite), pas un vrai bug à corriger. Cette prop ne
    // supprime l'avertissement QUE pour les attributs de cet élément précis, pas pour ses enfants.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased bg-surface-app text-content-main min-h-screen flex flex-col">
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  );
}