import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Chat } from './Chat';
import { Message } from './Message';

@Entity()
export class Contact {

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  karma: number;

  @ManyToMany(() => Chat, chat => chat.participants)
  chats: Chat[];

  @OneToMany(() => Message, message => message.sender)
  messages: Message[];
}
