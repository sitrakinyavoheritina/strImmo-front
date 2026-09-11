'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

// Affiché uniquement à partir de `lg:` (voir app/messages/layout.tsx, qui masque ce panneau en
// dessous de `lg:` pour laisser toute la place à la liste des conversations) : rien à afficher ici
// tant qu'aucun fil n'est sélectionné.
export default function MessagesPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
      <MessageCircle size={32} className="text-content-muted" />
      <p className="text-sm text-content-muted">{t.messages.selectConversation}</p>
    </div>
  );
}
