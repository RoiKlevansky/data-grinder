import Printer from '@darkobits/lolcatjs';
import figlet from 'figlet';
import fs from 'fs';
import name from 'project-name';
import qrTerminal from 'qrcode-terminal';
import 'reflect-metadata';
import 'source-map-support/register';
import { Client, Message } from 'whatsapp-web.js';
import { handleCommand } from './commandHandler';
import settings from './config/config';
import { dbCreateConnection } from './helpers/dbCreateConnection';
import { procMessage } from './incommingHandler';

let sessionData;
if (fs.existsSync(settings.sessionFilePath)) {
	sessionData = JSON.parse(fs.readFileSync(settings.sessionFilePath).toString());
}

(async () => { await dbCreateConnection(); })();

const client = new Client({
	session: sessionData,
	puppeteer: {
		executablePath: settings.chromePath,
	}
});

client.on('qr', (qr) => {
	qrTerminal.generate(qr, { small: true });
});

client.on('authenticated', (session) => {
	sessionData = session;
	fs.writeFile(settings.sessionFilePath, JSON.stringify(session), (err) => {
		if (err) {
			console.error(err);
		}
	});
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

