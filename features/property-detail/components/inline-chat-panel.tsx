'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import {
  useStartConversation,
  useConversation,
  useSendMessage,
  useMarkConversationRead,
} from '@/features/messages/hooks/use-messages';




/** Discussion avec le vendeur/l'annonceur, intégrée directement sous la photo de la page détail
 * d'annonce (pas de modal, pas d'autre page) — branchée sur la vraie messagerie (voir
 * features/messages) : "Discuter" démarre (ou reprend) la conversation liée à cette annonce, les
 * messages envoyés ici arrivent réellement chez le destinataire, identique au fil ouvert depuis
 * /messages/[id]. */
export function InlineChatPanel({
  propertyId,
  authorName,
  authorAvatarUrl,
  onClose,
}: {
  propertyId: string;
  authorName: string;
  authorAvatarUrl?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { mutate: startConversation, data: conversation, isPending: isStarting } = useStartConversation();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Le backend est idempotent (verrou côté service, voir messaging.service.ts), mais évite quand
  // même un second appel réseau inutile — notamment le double montage de React Strict Mode en dev.
  const startedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (startedForRef.current === propertyId) return;
    startedForRef.current = propertyId;
    startConversation({ propertyId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const conversationId = conversation?.id;
  const { data: messages, isLoading } = useConversation(conversationId ?? '');
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage(conversationId ?? '');
  useMarkConversationRead(conversationId ?? '', messages);

  const [draft, setDraft] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
  }, [messages?.length]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || !conversationId || isSending) return;
    setDraft('');
    try {
      await sendMessage(text);
    } catch {
      setDraft(text);
    }
  }

  return (
    <div className="mt-2 lg:flex-1 lg:min-h-0 min-h-[280px] border border-stroke-default rounded-xl flex flex-col overflow-hidden bg-surface-app lg:bg-surface-card">
      <div className="shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-b border-stroke-default">
        <Avatar name={authorName} imageUrl={authorAvatarUrl} size={28} />
        <span className="flex-1 font-semibold text-sm text-content-main truncate">{authorName}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.propertyDetail.chatClose}
          className="text-content-muted hover:text-content-main transition"
        >
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2">
        {isStarting || isLoading ? (
          <p className="text-sm text-content-muted text-center py-4">{t.search.searching}</p>
        ) : (
          messages?.map((message) => (
            <div key={message.id} className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl ${
                  message.senderId === currentUserId
                    ? 'bg-brand-primary text-white rounded-br-sm'
                    : 'bg-surface-card lg:bg-surface-app text-content-main rounded-bl-sm'
                }`}
              >
                {message.text}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 px-2.5 py-2.5 border-t border-stroke-default">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          disabled={!conversationId}
          placeholder={t.propertyDetail.chatPlaceholder}
          className="flex-1 min-w-0 px-3 py-2 bg-surface-card lg:bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted outline-none focus:border-brand-primary transition disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || !conversationId || isSending}
          aria-label={t.chat.send}
          className="shrink-0 w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center disabled:opacity-40 transition"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
