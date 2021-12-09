import Printer from '@darkobits/lolcatjs';
import figlet from 'figlet';
import name from 'project-name';
import puppeteer from 'puppeteer';
import qrTerminal from 'qrcode-terminal';
import 'reflect-metadata';
import 'source-map-support/register';
import wa from 'whatsapp-web.js';
import { handleCommand } from './commandHandler';
import settings from './config/config';
import { Chat } from './entities/Chat';
import { Contact } from './entities/Contact';
import { dbCreateConnection } from './helpers/dbCreateConnection';
import * as chatService from './services/chat.service';
import * as contactService from './services/contact.service';
import * as messageService from './services/message.service';

(async () => { await dbCreateConnection(); })();

const client = new wa.Client({
	puppeteer: {
		executablePath: settings.chromePath,
	} as puppeteer.LaunchOptions & puppeteer.BrowserLaunchArgumentOptions,
} as wa.ClientOptions);

const initStartupScan = async (client: wa.Client) => {
	const chats = await client.getChats();
	const contactsToChats = new Map<Contact, Chat[]>();
	for (const chat of chats) {
		const chatEntity = await chatService.createChat(chat);
		const participants = chat.isGroup ? (chat as wa.GroupChat).participants : [chat];
		for (const participant of participants) {
			const contact = await client.getContactById(participant.id._serialized);
			const contactEntity = await contactService.createContact(contact);
			if (!contactsToChats.has(contactEntity)) {
				contactsToChats.set(contactEntity, [chatEntity]);
			} else {
				contactsToChats.get(contactEntity)?.push(chatEntity);
			}
		}
	}
	for (const [contact, chats] of contactsToChats) {
		await contactService.updateContact(contact, { chats });
	}
}

const handleReply = async (msg: wa.Message): Promise<void> => {
	if (msg.hasQuotedMsg) {
		const quotedMsg = await msg.getQuotedMessage();
		if (quotedMsg) {
			const quotedContact = await quotedMsg.getContact();
			if (quotedContact && !quotedContact.isMe) {
				const quotedContactEntity = await contactService.createContact(quotedContact);
				await contactService.upvote(quotedContactEntity);
			}
		}
	}
}

const procMessage = async (message: wa.Message, client: wa.Client) => {
	await messageService.createMessage(message);
	if (!message.fromMe) {
		await handleReply(message);
	}
}

client.on('qr', (qr) => {
	qrTerminal.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('Client is ready!\n');
	const printer = new Printer();
	printer.fromString(figlet.textSync(name(), {
		horizontalLayout: 'fitted',
		font: 'ANSI Shadow'
	}));
	console.log(printer.toString());

	initStartupScan(client);
});

client.on('group_join', async (group: wa.GroupChat, contact: wa.Contact) => {
	try {
		if (contact) {
			const contactEntity = await contactService.createContact(contact);
			const chatEntity = await chatService.createChat(group);
			const chats = [...contactEntity.chats, chatEntity];
			await contactService.updateContact(contactEntity, { chats });
		} else {
			const chatEntity = await chatService.createChat(group);
			const participants = group.participants;
			for (const participant of participants) {
				const contact = await client.getContactById(participant.id._serialized);
				const contactEntity = await contactService.createContact(contact);
				const chats = [...contactEntity.chats, chatEntity];
				await contactService.updateContact(contactEntity, { chats });
			}
		}
	} catch (err) {
		console.error(err);
	}
});

client.on('group_leave', async (group: wa.GroupChat, contact: wa.Contact) => {
	try {
		const contactEntity = await contactService.createContact(contact);
		const chatEntity = await chatService.createChat(group);
		const chats = contactEntity.chats.filter(chat => chat.id !== chatEntity.id);
		await contactService.updateContact(contactEntity, { chats });
	} catch (err) {
		console.error(err);
	}
});

client.on('message_create', async (message: wa.Message) => {
	try {
		await procMessage(message, client);
		await handleCommand(message);
	} catch (err) {
		console.error(err);
	}
});

client.initialize();
