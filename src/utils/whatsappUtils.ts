import settings from '../config/config';
import wa from 'whatsapp-web.js';

export const getName = (contact: wa.Contact): string => {
    return contact.isMe ? settings.personalName : contact.pushname || contact.name || '';
}
