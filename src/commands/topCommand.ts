import { getRepository, Repository } from "typeorm";
import wa from "whatsapp-web.js";
import { Chat } from "../entities/Chat";

export const topCommand = async (msg: wa.Message): Promise<void> => {
  const chatRepository: Repository<Chat> = getRepository(Chat);

  const chat: wa.Chat = await msg.getChat();
  const chatEntity: Chat | undefined = await chatRepository.findOne({ id: chat.id._serialized }, { relations: ["participants"] });
  if (!chatEntity) {
    return;
  }
  const participants = chatEntity.participants;
  const sortedParticipants = participants.sort((a, b) => b.karma - a.karma);
  const topParticipants = sortedParticipants.slice(0, 10);
  const topParticipantsString = topParticipants.map(p => `${p.name} (${p.karma})`).join("\n");
  await msg.reply(`Top participants:\n${topParticipantsString}`);
}