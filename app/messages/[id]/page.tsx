'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProperty } from '@/features/search/hooks/use-property';
import { formatPrice } from '@/features/search/utils/format-price';
import { ArrowLeft, Check, CheckCheck, ImagePlus, Send } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { Avatar } from '@/components/ui/avatar';
import { MessageImage } from '@/features/messages/components/message-image';
import { checkChatImage } from '@/lib/messages/chat-image';
import {
  useConversation,
  useConversations,
  useMarkConversationRead,
  useSendImageMessage,
  useSendMessage,
} from '@/features/messages/hooks/use-messages';
import { getSocket } from '@/lib/realtime/socket-client';
import { useMarkConversationNotificationsRead } from '@/features/notifications/hooks/use-notifications';
import type { Message } from '@/features/messages/types/message.types';

// En dessous de ce délai depuis le dernier envoi, on n'émet pas un nouveau "typing" (évite de
// spammer la WebSocket à chaque frappe) — l'autre participant efface son indicateur tout seul
// après TYPING_CLEAR_MS sans nouvel événement.
const TYPING_EMIT_THROTTLE_MS = 2000;
const TYPING_CLEAR_MS = 3000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type ListItem =
  | { type: 'separator'; key: string; label: string }
  | { type: 'message'; key: string; message: Message };

function Bubble({ message, isMine }: { message: Message; isMine: boolean }) {
  const isRead = Boolean(message.readAt);
  return (
    <div className={`max-w-[75%] flex flex-col gap-1 ${isMine ? 'items-end self-end' : 'items-start self-start'}`}>
      {message.imageUrl ? (
        <MessageImage src={message.imageUrl} />
      ) : (
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isMine ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-surface-app text-content-main rounded-bl-sm'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex items-center gap-1 px-1">
        <span className="text-[10px] text-content-muted">{formatTime(message.sentAt)}</span>
        {isMine &&
          (isRead ? (
            <CheckCheck size={12} className="text-brand-primary" />
          ) : (
            <Check size={12} className="text-content-muted" />
          ))}
      </div>
    </div>
  );
}

export default function ConversationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  // La garde d'authentification (redirection vers /connexion) vit dans app/messages/layout.tsx,
  // partagée avec la liste — cette page ne se monte jamais pour un visiteur déconnecté.
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Les infos du participant (nom/avatar) viennent du cache de la liste des conversations, déjà
  // chargée dans la quasi-totalité des cas (on arrive ici depuis cette liste) — évite un endpoint
  // dédié rien que pour l'en-tête.
  const { data: conversations } = useConversations();
  const conversation = conversations?.find((item) => item.id === id);
  const { data: conversationProperty } = useProperty(conversation?.propertyId);

  const { data: messages, isLoading } = useConversation(id);
  const { mutateAsync: sendMessage, isPending } = useSendMessage(id);
  const { mutateAsync: sendImage, isPending: isSendingImage } = useSendImageMessage(id);
  useMarkConversationRead(id, messages);
  useMarkConversationNotificationsRead(id);

  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingEmitRef = useRef(0);
  const typingClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dépend de `isAuthenticated` (pas seulement `id`) : au premier montage, la session peut ne pas
  // avoir fini de se réhydrater depuis localStorage (voir useAuthHasHydrated) — la WebSocket
  // globale (RealtimeProvider) ne s'est alors pas encore connectée et `getSocket()` renvoie encore
  // `null` à cet instant. Sans cette dépendance, l'effet ne se relance jamais une fois la
  // connexion établie et l'indicateur "en train d'écrire" ne s'affiche jamais côté destinataire.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleTyping(payload: { conversationId: string }) {
      if (payload.conversationId !== id) return;
      setIsOtherTyping(true);
      if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current);
      typingClearTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), TYPING_CLEAR_MS);
    }

    socket.on('typing', handleTyping);
    return () => {
      socket.off('typing', handleTyping);
      if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current);
    };
  }, [id, isAuthenticated]);

  const listItems = useMemo<ListItem[]>(() => {
    if (!messages) return [];
    const items: ListItem[] = [];
    let lastDateKey: string | null = null;
    for (const message of messages) {
      const date = new Date(message.sentAt);
      const dateKey = date.toDateString();
      if (dateKey !== lastDateKey) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const label = isSameDay(date, today)
          ? t.messages.today
          : isSameDay(date, yesterday)
            ? t.messages.yesterday
            : date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
        items.push({ type: 'separator', key: `sep-${dateKey}`, label });
        lastDateKey = dateKey;
      }
      items.push({ type: 'message', key: message.id, message });
    }
    return items;
  }, [messages, t]);

  function scrollToBottom() {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }));
  }

  useEffect(() => {
    scrollToBottom();
  }, [listItems.length]);

  function handleDraftChange(text: string) {
    setDraft(text);
    const now = Date.now();
    if (text.trim() && now - lastTypingEmitRef.current > TYPING_EMIT_THROTTLE_MS) {
      lastTypingEmitRef.current = now;
      getSocket()?.emit('typing', { conversationId: id });
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || isPending) return;
    setDraft('');
    setErrorMessage(null);
    try {
      await sendMessage(text);
    } catch {
      setDraft(text);
      setErrorMessage(t.messages.sendError);
    }
  }

  async function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || isSendingImage) return;

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

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Visible seulement en dessous de `lg:` (le panneau liste, toujours affiché à partir de
          `lg:`, sert alors lui-même de "retour" — voir app/messages/layout.tsx). */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 border-b border-stroke-default">
        <button
          type="button"
          onClick={() => router.push('/messages')}
          aria-label={t.messages.title}
          className="lg:hidden text-content-muted hover:text-content-main transition -ml-1 p-1"
        >
          <ArrowLeft size={18} />
        </button>
        <Avatar name={conversation?.participantName ?? '?'} imageUrl={conversation?.participantAvatarUrl} size={32} />
        <span className="font-bold text-content-main truncate">
          {conversation?.participantName ?? t.messages.conversationTitle}
        </span>
      </div>

      {/* Bien concerné par cette discussion (conversation ouverte depuis une annonce) — sans cette
          carte, rien n'indique de quelle annonce il s'agit. */}
      {conversationProperty && (
        <Link
          href={`/annonce/${conversationProperty.id}`}
          className="shrink-0 flex items-center gap-2.5 px-4 py-2 border-b border-stroke-default bg-surface-app hover:bg-stroke-default/40 transition"
        >
          <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-stroke-default">
            {conversationProperty.mainPhotoUrl && (
              <Image src={conversationProperty.mainPhotoUrl} alt="" fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] text-content-muted">{t.propertyDetail.chatAboutProperty}</p>
            <p className="text-[0.85rem] font-semibold text-content-main truncate">{conversationProperty.title}</p>
            <p className="text-[12px] font-bold text-brand-secondary-text">{formatPrice(conversationProperty.price)}</p>
          </div>
        </Link>
      )}

      {isLoading ? (
        <p className="text-sm text-content-muted py-6 text-center">{t.search.searching}</p>
      ) : (
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {listItems.length > 0 ? (
            listItems.map((item) =>
              item.type === 'separator' ? (
                <span
                  key={item.key}
                  className="self-center bg-stroke-default/60 text-content-muted text-[0.85rem] font-medium px-3 py-1 rounded-full my-1"
                >
                  {item.label}
                </span>
              ) : (
                <Bubble key={item.key} message={item.message} isMine={item.message.senderId === currentUserId} />
              ),
            )
          ) : (
            <p className="text-sm text-content-muted text-center py-8">{t.messages.emptyConversation}</p>
          )}
          {isOtherTyping && (
            <div className="self-start bg-surface-app text-content-muted text-sm px-3 py-2 rounded-2xl">
              {t.messages.typingIndicator}
            </div>
          )}
        </div>
      )}

      {errorMessage && <p className="shrink-0 text-[0.85rem] text-danger px-4 pb-1">{errorMessage}</p>}

      <div className="shrink-0 flex items-end gap-2 px-3 py-3 border-t border-stroke-default">
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePickImage} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingImage}
          aria-label={t.messages.attachPhoto}
          title={t.messages.attachPhoto}
          className="shrink-0 w-10 h-10 rounded-full border border-stroke-default flex items-center justify-center text-content-muted hover:text-content-main transition disabled:opacity-40"
        >
          <ImagePlus size={16} />
        </button>
        <input
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          placeholder={t.messages.inputPlaceholder}
          className="flex-1 min-w-0 px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted outline-none focus:border-brand-primary transition"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || isPending}
          className="shrink-0 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center disabled:opacity-40 transition"
        >
          <Send size={16} />
        </button>
      </div>
    </>
  );
}
