import { getRepository, Repository } from 'typeorm';
import wa from 'whatsapp-web.js';
import { Chat } from '../entities/Chat';
import { Contact } from '../entities/Contact';
import { Message } from '../entities/Message';
import { getContactName } from '../utils/whatsappUtils';

/**
 * Record contact into database.
 * If contact already exists, and name is different, updates name.
 * @param contact {wa.Contact}
 * @returns Promise<Contact>
 */
export const createContact = async (contact: wa.Contact): Promise<Contact> => {
    const contactRepository: Repository<Contact> = getRepository(Contact);
    let contactEntity: Contact | undefined = await contactRepository.findOne({ id: contact.id._serialized });
    const contactName = getContactName(contact);
    if (!contactEntity) {
        contactEntity = new Contact();
        contactEntity.id = contact.id._serialized;
        contactEntity.name = contactName;
        contactEntity.chats = [];
        contactEntity.karma = 0;
    } else if (contactEntity.name !== contactName) {
        contactEntity.name = contactName;
    }
    await contactRepository.save(contactEntity);
    return contactEntity;
}

export type ContactData = {
    name?: string,
    karma?: number,
    chats?: Chat[],
    messages?: Message[],
}

/**
 * Updates contact data from data object.
 * @param contact {Contact}
 * @param data {ContactData}
 * @returns 
 */
export const updateContact = async (contact: Contact, data: ContactData): Promise<Contact> => {
    const contactRepository: Repository<Contact> = getRepository(Contact);
    if (data.name) contact.name = data.name;
    if (data.karma) contact.karma = data.karma;
    if (data.chats) contact.chats = data.chats;
    if (data.messages) contact.messages = data.messages;
    await contactRepository.save(contact);
    return contact;
}

/**
 * Increase contact karma by 1.
 * @param contact {Contact}
 * @returns Promise<Contact>
 */
export const upvote = async (contact: Contact): Promise<Contact> => {
    contact.karma++;
    return updateContact(contact, { karma: contact.karma });
}