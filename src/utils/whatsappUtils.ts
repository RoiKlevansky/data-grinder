import wa from 'whatsapp-web.js';
import settings from '../config/config';

export const getContactName = (contact: wa.Contact): string => {
    return contact.isMe ? settings.personalName : contact.pushname || contact.name || '';
}
