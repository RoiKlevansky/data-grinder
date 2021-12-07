import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Contact } from "./Contact";
import { Message } from "./Message";

@Entity()
export class Chat {

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  isGroup: boolean;

  @ManyToMany(() => Contact, contact => contact.chats)
  @JoinTable()
  participants: Contact[];
  
  @OneToMany(() => Message, message => message.chat)
  messages: Message[];
}