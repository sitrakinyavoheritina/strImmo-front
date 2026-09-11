'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import type { Conversation } from '../types/message.types';

export function ConversationItem({
  conversation,
  isActive,
}: {
  conversation: Conversation;
  isActive?: boolean;
}) {
  const hasUnread = conversation.unreadCount > 0;
  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={`flex items-center gap-3 px-3 py-3 transition ${
        isActive ? 'bg-brand-primary-soft' : 'hover:bg-surface-app'
      }`}
    >
      <Avatar name={conversation.participantName} imageUrl={conversation.participantAvatarUrl} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-content-main truncate">{conversation.participantName}</p>
        {/* En gras + couleur "principale" (au lieu de "muted") quand non lu — distinction visuelle
            en plus du badge numérique, même convention que Messenger/WhatsApp. */}
        <p
          className={`text-sm truncate ${
            hasUnread ? 'text-content-main font-semibold' : 'text-content-muted'
          }`}
        >
          {conversation.lastMessage}
        </p>
      </div>
      {hasUnread && (
        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center">
          {conversation.unreadCount}
        </span>
      )}
    </Link>
  );
}
