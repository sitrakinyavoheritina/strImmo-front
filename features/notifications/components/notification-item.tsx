'use client';

import type { AppNotification } from '../types/notification.types';

export function NotificationItem({
  notification,
  onClick,
}: {
  notification: AppNotification;
  onClick: (notification: AppNotification) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`w-full text-left px-4 py-3 transition hover:bg-surface-app ${
        notification.read ? '' : 'bg-brand-primary-soft'
      }`}
    >
      <div className="flex items-center gap-2">
        {!notification.read && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />}
        <span className="font-semibold text-sm text-content-main">{notification.title}</span>
      </div>
      <p className="text-sm text-content-muted mt-0.5">{notification.body}</p>
    </button>
  );
}
