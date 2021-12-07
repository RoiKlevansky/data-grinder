import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { MessageTypes } from "whatsapp-web.js";
import { Chat } from "./Chat";
import { Contact } from "./Contact";

@Entity()
export class Message {
  
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Contact, contact => contact.messages)
  sender: Contact;

  @ManyToOne(() => Chat, chat => chat.messages)
  chat: Chat;

  @Column({
    type: "enum",
    enum: MessageTypes,
    default: MessageTypes.TEXT
  })
  type: MessageTypes;

  @CreateDateColumn()
  createdAt: Date;
}