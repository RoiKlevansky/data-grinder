import { getRepository, Repository } from 'typeorm';
import wa from 'whatsapp-web.js';
import { Chat } from '../entities/Chat';
import { Contact } from '../entities/Contact';
import { Message } from '../entities/Message';

/**
 * Records message into the database.
 * @param message {wa.Message}
 * @returns Promise<Message | undefined>
 */
export const createMessage = async (message: wa.Message): Promise<Message | undefined> => {
    if (!Object.values(wa.MessageTypes).includes(message.type)) {
        return;
    }

    const chatRepository: Repository<Chat> = getRepository(Chat);
    const contactRepository: Repository<Contact> = getRepository(Contact);
    const messageRepository: Repository<Message> = getRepository(Message);

    const chat: wa.Chat = await message.getChat();
    const chatEntity: Chat | undefined = await chatRepository.findOne({ id: chat.id._serialized });
    if (!chatEntity) {
        return;
    }
    const contact: wa.Contact = await message.getContact();
    const contactEntity: Contact | undefined = await contactRepository.findOne({ id: contact.id._serialized });
    if (!contactEntity) {
        return;
    }

    const messageEntity: Message = new Message();
    messageEntity.id = message.id._serialized;
    messageEntity.chat = chatEntity;
    messageEntity.sender = contactEntity;
    messageEntity.type = message.type;
    await messageRepository.save(messageEntity);
    return messageEntity;
}
