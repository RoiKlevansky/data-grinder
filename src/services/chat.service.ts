import { getRepository, Repository } from 'typeorm';
import wa from 'whatsapp-web.js';
import { Chat } from '../entities/Chat';

/**
 * Records chat into database.
 * If chat already exists, and name has changed, updates name.
 * @param chat {wa.Chat}
 * @returns Promise<Chat>
 */
export const createChat = async (chat: wa.Chat) => {
  const chatRepository: Repository<Chat> = getRepository(Chat);
  let chatEntity: Chat | undefined = await chatRepository.findOne({ id: chat.id._serialized });
  if (!chatEntity) {
    chatEntity = new Chat();
    chatEntity.id = chat.id._serialized;
    chatEntity.name = chat.name;
    chatEntity.isGroup = chat.isGroup;
    chatEntity.participants = [];
  } else if (chatEntity.name !== chat.name) {
    chatEntity.name = chat.name;
  }
  await chatRepository.save(chatEntity);
  return chatEntity;
}
