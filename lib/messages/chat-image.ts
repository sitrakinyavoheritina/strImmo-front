// Pièce jointe d'un chat : images uniquement. `accept="image/*"` du sélecteur de fichiers n'est
// qu'une aide (l'utilisateur peut choisir « tous les fichiers ») — cette vérification est la vraie
// garde côté navigateur ; le serveur refuse aussi tout ce qui n'est pas une image (voir
// strImmo/src/messaging/messaging.service.ts:sendImageMessage, 15 Mo max).
export const MAX_CHAT_IMAGE_SIZE = 15 * 1024 * 1024;

export type ChatImageProblem = 'notImage' | 'tooLarge';

export function checkChatImage(file: File): ChatImageProblem | null {
  if (!file.type.startsWith('image/')) return 'notImage';
  if (file.size > MAX_CHAT_IMAGE_SIZE) return 'tooLarge';
  return null;
}
