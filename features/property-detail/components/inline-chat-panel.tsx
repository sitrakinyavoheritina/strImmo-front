'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/features/search/utils/format-price';
import { Avatar } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import {
  useStartConversation,
  useConversation,
  useSendMessage,
  useSendImageMessage,
  useMarkConversationRead,
} from '@/features/messages/hooks/use-messages';
import { MessageImage } from '@/features/messages/components/message-image';
import { checkChatImage } from '@/lib/messages/chat-image';




/** Discussion avec le vendeur/l'annonceur, intégrée directement sous la photo de la page détail
 * d'annonce (pas de modal, pas d'autre page) — branchée sur la vraie messagerie (voir
 * features/messages) : "Discuter" démarre (ou reprend) la conversation liée à cette annonce, les
 * messages envoyés ici arrivent réellement chez le destinataire, identique au fil ouvert depuis
 * /messages/[id]. */
export function InlineChatPanel({
  propertyId,
  authorName,
  authorAvatarUrl,
  propertyTitle,
  propertyPrice,
  propertyPhotoUrl,
  onClose,
}: {
  propertyId: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyPhotoUrl?: string;
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
  const { mutateAsync: sendImage, isPending: isSendingImage } = useSendImageMessage(conversationId ?? '');
  useMarkConversationRead(conversationId ?? '', messages);

  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Pièce jointe : images uniquement (même règle et même route que le chat en pleine page).
  async function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !conversationId || isSendingImage) return;

    const problem = checkChatImage(file);
    if (problem) {
      setErrorMessage(problem === 'notImage' ? t.messages.photoOnly : t.messages.photoTooLarge);
      return;
    }

    setErrorMessage(null);
    try {
      await sendImage(file);
    } catch {
      setErrorMessage(t.messages.photoUploadError);
    }
  }

  return (
    // Mobile (< lg) : feuille fixée en bas d'écran, à mi-hauteur — le reste de la page reste
    // visible et défilable derrière (pas de fond bloquant). Desktop : panneau intégré sous la
    // photo, comme avant.
    <div className="fixed inset-x-0 bottom-0 z-50 h-[50vh] rounded-t-2xl border-t border-x border-stroke-default shadow-[0_-8px_24px_rgba(0,0,0,0.15)] lg:static lg:z-auto lg:mt-2 lg:h-auto lg:flex-1 lg:min-h-[280px] lg:min-h-0 lg:rounded-xl lg:border lg:shadow-none flex flex-col overflow-hidden bg-surface-card">
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

      {/* Trace du bien concerné : sans elle, rien n'indique dans la discussion de quelle annonce il
          s'agit. */}
      {propertyTitle && (
        <div className="shrink-0 flex items-center gap-2.5 px-3 py-2 border-b border-stroke-default bg-surface-app">
          <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-stroke-default">
            {propertyPhotoUrl && <Image src={propertyPhotoUrl} alt="" fill className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] text-content-muted">{t.propertyDetail.chatAboutProperty}</p>
            <p className="text-[0.85rem] font-semibold text-content-main truncate">{propertyTitle}</p>
            {propertyPrice != null && (
              <p className="text-[12px] font-bold text-brand-secondary-text">{formatPrice(propertyPrice)}</p>
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2">
        {isStarting || isLoading ? (
          <p className="text-sm text-content-muted text-center py-4">{t.search.searching}</p>
        ) : (
          messages?.map((message) => (
            <div key={message.id} className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              {message.imageUrl ? (
                <MessageImage src={message.imageUrl} size={160} />
              ) : (
                <p
                  className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl ${
                    message.senderId === currentUserId
                      ? 'bg-brand-primary text-white rounded-br-sm'
                      : 'bg-surface-card lg:bg-surface-app text-content-main rounded-bl-sm'
                  }`}
                >
                  {message.text}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {errorMessage && <p className="shrink-0 text-[0.85rem] text-danger px-3 pb-1">{errorMessage}</p>}

      <div className="shrink-0 flex items-center gap-2 px-2.5 py-2.5 border-t border-stroke-default">
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePickImage} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!conversationId || isSendingImage}
          aria-label={t.messages.attachPhoto}
          title={t.messages.attachPhoto}
          className="shrink-0 w-9 h-9 rounded-full border border-stroke-default flex items-center justify-center text-content-muted hover:text-content-main transition disabled:opacity-40"
        >
          <ImagePlus size={16} />
        </button>
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
