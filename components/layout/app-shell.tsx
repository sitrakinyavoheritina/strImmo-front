import { Topbar } from './topbar';
import { Sidebar } from './sidebar';
import { MobileNavStrip } from './mobile-nav-strip';
import { RealtimeProvider } from './realtime-provider';
import { AdminRouteGuard } from './admin-route-guard';

/** Habillage global du site : topbar + sidebar gauche (desktop) / bande d'icônes en bas d'écran
 * (mobile, comme l'app mobile — demandé explicitement). `MobileNavStrip` est fixée en bas ; la
 * marge `pb-16` sous `main` (retirée à partir de `lg:`, où la bande n'existe plus) laisse la place
 * pour qu'elle ne masque jamais le bas du contenu de la page. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-app text-content-main">
      <RealtimeProvider />
      <AdminRouteGuard />
      <Topbar />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-16 lg:pb-0 lg:pl-4">{children}</main>
      </div>
      <MobileNavStrip />
    </div>
  );
}
