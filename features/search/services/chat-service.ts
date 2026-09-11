import { chatApi } from './chat-api';
import { mapApiPropertyToProperty } from './property-mapper';
import type { ChatMessage } from '../types/chat.types';

export const chatService = {
  sendMessage: (history: ChatMessage[]) =>
    chatApi.sendMessage(history).then((response) => ({
      reply: response.reply,
      properties: response.properties.map(mapApiPropertyToProperty),
    })),
};
