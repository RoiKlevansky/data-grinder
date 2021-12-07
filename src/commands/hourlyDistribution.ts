import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import Jimp from 'jimp';
import { Repository, getRepository } from 'typeorm';
import wa from 'whatsapp-web.js';
import { Contact } from '../entities/Contact';

export const hourleyDistributionCommand = async (msg: wa.Message) => {
    const contactRepository: Repository<Contact> = getRepository(Contact);
    const contact = await msg.getContact();
    const contactEntity = await contactRepository.findOne({ id: contact.id._serialized }, { relations: ['messages'] });
    if (!contactEntity) {
        return;
    }
    const chartCanvas = new ChartJSNodeCanvas({ width: 700, height: 700 });
    const messages = contactEntity.messages;
    const messagesByHour = [];
    for (let i = 0; i < 24; i++) {
        messagesByHour[i] = 0;
    }
    for (const msg of messages) {
        const hour = new Date(msg.createdAt).getHours();
        messagesByHour[hour]++;
    }
    const labels = [];
    for (let i = 0; i < 24; i++) {
        labels[i] = `${('0' + i).slice(-2)}:00`;
    }
    const data = {
        labels,
        datasets: [
            {
                label: 'Messages',
                data: Object.values(messagesByHour),
                borderColor: '#3e95cd',
                backgroundColor: '#3e95cd',
            }
        ],
    };
    const chartConfig: ChartConfiguration = {
        type: 'bar',
        data,
    };
    const chart = await chartCanvas.renderToBuffer(chartConfig, Jimp.MIME_PNG);
    const res = chart.toString('base64');
    await msg.reply(new wa.MessageMedia(Jimp.MIME_PNG, res, 'chart.png'));
}