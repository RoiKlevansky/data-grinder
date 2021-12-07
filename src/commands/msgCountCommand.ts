import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { getRepository, Repository } from 'typeorm';
import wa from 'whatsapp-web.js';
import { Contact } from '../entities/Contact';
import Jimp from 'jimp';
import { ChartConfiguration } from 'chart.js';

export const msgCountCommand = async (msg: wa.Message) => {
    

    const contactRepository: Repository<Contact> = getRepository(Contact);
    const contact = await msg.getContact();
    const contactEntity = await contactRepository.findOne({ id: contact.id._serialized }, { relations: ['messages'] });
    if (!contactEntity) {
        return;
    }
    const chartCanvas = new ChartJSNodeCanvas({ width: 500, height: 500 });
    const messages = contactEntity.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const messageCountByDay: Record<string, number> = messages.reduce((acc: Record<string, number>, msg) => {
        const date = msg.createdAt.toLocaleDateString();
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date]++;
        return acc;
    }, {});
    const labels = Object.keys(messageCountByDay);
    const values = Object.values(messageCountByDay);
    const data = {
        labels,
        datasets: [{
            label: 'Message Count',
            data: values,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        }],
    };
    const chartConfig: ChartConfiguration = {
        type: 'line',
        data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    }
    const chart = await chartCanvas.renderToBuffer(chartConfig, Jimp.MIME_PNG);
    const res = chart.toString('base64');
    await msg.reply(new wa.MessageMedia(Jimp.MIME_PNG, res, 'chart.png'));
}