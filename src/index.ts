import Printer from '@darkobits/lolcatjs';
import figlet from 'figlet';
import name from 'project-name';
import qrTerminal from 'qrcode-terminal';
import 'reflect-metadata';
import 'source-map-support/register';
import { Client, ClientOptions, Message } from 'whatsapp-web.js';
import puppeteer from 'puppeteer';
import { handleCommand } from './commandHandler';
import settings from './config/config';
import { dbCreateConnection } from './helpers/dbCreateConnection';
import { procMessage } from './incommingHandler';

(async () => { await dbCreateConnection(); })();

const client = new Client({
	puppeteer: {
		executablePath: settings.chromePath,
	} as puppeteer.LaunchOptions & puppeteer.BrowserLaunchArgumentOptions,
	userAgent: "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
} as ClientOptions);

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
});

client.on('message_create', async (msg: Message) => {
	try {
		await procMessage(msg, client);
		await handleCommand(msg);
	} catch (err) {
		console.error(err);
	}
});

client.initialize();

