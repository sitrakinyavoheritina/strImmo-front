'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/use-notifications';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { RightRail } from '@/features/feed/components/right-rail';
import type { AppNotification } from '@/features/notifications/types/notification.types';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();

  // Une notification liée à une annonce (refus/validation) ouvre son détail ; un nouveau message
  // n'a pas d'identifiant de conversation sur la notification elle-même (voir
  // strImmo/src/notifications/entities/notification.entity.ts) — direction la liste des messages.
  function handleClick(notification: AppNotification) {
    if (!notification.read) markAsRead(notification.id);
    if (notification.propertyId) {
      router.push(`/annonce/${notification.propertyId}`);
    } else if (notification.kind === 'new_message') {
      router.push('/messages');
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto py-3 sm:py-6">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary mb-4">{t.notificationsPage.title}</h1>

        {isLoading ? (
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        ) : notifications && notifications.length > 0 ? (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm divide-y divide-stroke-default overflow-hidden">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onClick={handleClick} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-2 py-16 text-center">
            <Bell size={32} className="text-content-muted" />
            <p className="font-semibold text-content-main">{t.notificationsPage.emptyTitle}</p>
            <p className="text-sm text-content-muted">{t.notificationsPage.emptyDescription}</p>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
