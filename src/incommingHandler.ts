import { getRepository, Repository } from "typeorm";
import wa from "whatsapp-web.js";
import settings from "./config/config";
import { Chat } from "./entities/Chat";
import { Contact } from "./entities/Contact";
import { Message } from "./entities/Message";

const handleReply = async (msg: wa.Message): Promise<void> => {
  if (msg.hasQuotedMsg) {
    const quotedMsg = await msg.getQuotedMessage();
    if (quotedMsg) {
      const quotedContact = await quotedMsg.getContact();
      if (quotedContact && !quotedContact.isMe) {
        let quotedContactEntry = await getRepository(Contact).findOne({ id: quotedContact.id._serialized });
        if (quotedContactEntry) {
          quotedContactEntry.karma += 1;
        } else {
          quotedContactEntry = new Contact();
          quotedContactEntry.id = quotedContact.id._serialized;
          quotedContactEntry.name = quotedContact.pushname;
          quotedContactEntry.karma = 1;
        }
        await getRepository(Contact).save(quotedContactEntry);
      }
    }
  }
}

const addMessage = async (msg: wa.Message): Promise<void> => {
  if (!Object.values(wa.MessageTypes).includes(msg.type)) {
    return;
  }

  const chatRepository: Repository<Chat> = getRepository(Chat);
  const contactRepository: Repository<Contact> = getRepository(Contact);
  const messageRepository: Repository<Message> = getRepository(Message);

  const chat: wa.Chat = await msg.getChat();
  const chatEntity: Chat | undefined = await chatRepository.findOne({ id: chat.id._serialized });
  if (!chatEntity) {
    return;
  }
  const contact: wa.Contact = await msg.getContact();
  const contactEntity: Contact | undefined = await contactRepository.findOne({ id: contact.id._serialized });
  if (!contactEntity) {
    return;
  }
  const messageEntity: Message = new Message();
  messageEntity.id = msg.id._serialized;
  messageEntity.chat = chatEntity;
  messageEntity.sender = contactEntity;
  messageEntity.type = msg.type;
  await messageRepository.save(messageEntity);
}

const addAllParticipants = async (chat: wa.Chat, client: wa.Client): Promise<void> => {
  const chatRepository: Repository<Chat> = getRepository(Chat);
  const chatEntity: Chat | undefined = await chatRepository.findOne({ id: chat.id._serialized });
  if (!chatEntity) {
    return;
  }
  const participants = [];
  if (chat.isGroup) {
    participants.push(...(chat as wa.GroupChat).participants);
  } else {
    participants.push({ id: { _serialized: chat.id._serialized } });
  }
  for (const participant of participants) {
    const contactRepository: Repository<Contact> = getRepository(Contact);
    const contact = await client.getContactById(participant.id._serialized);
    if (!contact) {
      continue;
    }
    let contactEntity: Contact | undefined = await contactRepository.findOne({ id: participant.id._serialized }, { relations: ["chats"] });
    const contactName = contact.isMe ? settings.personalName : contact.pushname || contact.name || "";
    if (!contactEntity) {
      contactEntity = new Contact();
      contactEntity.id = contact.id._serialized;
      contactEntity.name = contactName;
      contactEntity.chats = [chatEntity];
      contactEntity.karma = 0;
    } else {
      if (contactEntity.name !== contactName) {
        contactEntity.name = contactName;
      }
      if (!contactEntity.chats.find((chat: Chat) => chat.id == chatEntity.id)) {
        contactEntity.chats.push(chatEntity);
      }
    }
    await contactRepository.save(contactEntity);
  }
}

const addChat = async (chat: wa.Chat): Promise<void> => {
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
}

export const procMessage = async (msg: wa.Message, client: wa.Client) => {
  const chat: wa.Chat = await msg.getChat();
  await addChat(chat);
  await addAllParticipants(chat as wa.GroupChat, client);
  await addMessage(msg);
  if (!msg.fromMe) {
    await handleReply(msg);
  }
}