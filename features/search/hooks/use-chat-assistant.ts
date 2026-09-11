import { useMutation } from '@tanstack/react-query';
import { chatService } from '../services/chat-service';
import type { ChatMessage } from '../types/chat.types';

// `useMutation` : chaque message est une action ponctuelle qu'on déclenche, pas une donnée qu'on
// lit passivement.
export function useChatAssistant() {
  return useMutation({
    mutationFn: (history: ChatMessage[]) => chatService.sendMessage(history),
  });
}
