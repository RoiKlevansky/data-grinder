import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import Jimp from 'jimp';
import { getRepository, Repository } from 'typeorm';
import wa from 'whatsapp-web.js';
import { Contact } from '../entities/Contact';
import * as chartjsPluginDatalabels from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData } from 'chart.js';

const typeColors: Record<string, string> = {
    [wa.MessageTypes.TEXT]: '#00ff00',
    [wa.MessageTypes.IMAGE]: '#ff0000',
    [wa.MessageTypes.VIDEO]: '#0000ff',
    [wa.MessageTypes.AUDIO]: '#ffff00',
    [wa.MessageTypes.DOCUMENT]: '#ff00ff',
    [wa.MessageTypes.STICKER]: '#00ffff',
    [wa.MessageTypes.CONTACT_CARD]: '#ffffff',
    [wa.MessageTypes.LOCATION]: '#000000',
    [wa.MessageTypes.VOICE]: '#000000',
}

const typeDisplayNames: Record<string, string> = {
    [wa.MessageTypes.TEXT]: 'Text',
    [wa.MessageTypes.IMAGE]: 'Image',
    [wa.MessageTypes.VIDEO]: 'Video',
    [wa.MessageTypes.AUDIO]: 'Audio',
    [wa.MessageTypes.DOCUMENT]: 'Document',
    [wa.MessageTypes.STICKER]: 'Sticker',
    [wa.MessageTypes.CONTACT_CARD]: 'Contact Card',
    [wa.MessageTypes.LOCATION]: 'Location',
    [wa.MessageTypes.VOICE]: 'Voice',
}

export const msgTypesCommand = async (msg: wa.Message) => {
    const contactRepository: Repository<Contact> = getRepository(Contact);
    const contact = await msg.getContact();
    const contactEntity = await contactRepository.findOne({ id: contact.id._serialized }, { relations: ['messages'] });
    if (!contactEntity) {
        return;
    }
    console.log(1);
    const chartCanvas = new ChartJSNodeCanvas({
        width: 500, height: 500, chartCallback: (chart) => {
            chart.register(chartjsPluginDatalabels);
        }
    });
    console.log(2);
    const typeCounts = contactEntity.messages.reduce((acc, msg) => {
        const type = msg.type;
        if (!Object.keys(typeColors).includes(type)) {
            return acc;
        }
        if (!acc[type]) {
            acc[type] = 0;
        }
        acc[type]++;
        return acc;
    }, {} as Record<wa.MessageTypes, number>);
    const labels = Object.keys(typeCounts).map(type => typeDisplayNames[type]);
    const colors = Object.keys(typeCounts).map(type => typeColors[type]);
    const precentages = Object.keys(typeCounts).map(type => (typeCounts[type as wa.MessageTypes] / contactEntity.messages.length * 100));
    const data: ChartData = {
        labels,
        datasets: [{
            data: precentages,
            backgroundColor: colors,
            datalabels: {
                labels: {
                    name: {
                        align: 'top',
                        textStrokeColor: 'black',
                        textStrokeWidth: 2,
                        font: { size: 16 },
                        formatter: (value: number, context: any) => {
                            return context.chart.data.labels[context.dataIndex];
                        }
                    },
                    value: {
                        align: 'bottom',
                        font: { size: 18 },
                        backgroundColor: 'white',
                        borderWidth: 2,
                        borderRadius: 4,
                        formatter: (value: number, context: any) => {
                            return Math.round(value) + '%';
                        },
                        color: (context: any) => {
                            return context.dataset.backgroundColor;
                        },
                        padding: 4,
                    }
                }
            }
        }],
    };
    const chartConfig: ChartConfiguration = {
        type: 'pie',
        data,
        options: {
            plugins: {
                datalabels: {
                    color: 'white',
                    display: (context: any) => {
                        return context.dataset.data[context.dataIndex] > 10;
                    },
                    font: {
                        weight: 'bold',
                    },
                    offset: 0,
                    padding: 0,
                },
            },
        }
    }
    console.log(3);
    const chart = await chartCanvas.renderToBuffer(chartConfig, Jimp.MIME_PNG);
    console.log(4);
    const res = chart.toString('base64');
    let caption = 'Message types\n--------------------------\n';
    for (let i = 0; i < labels.length; i++) {
        caption += `${labels[i]}: ${precentages[i].toFixed(2)}%\n`;
    }
    caption = caption.trim();
    await msg.reply(new wa.MessageMedia(Jimp.MIME_PNG, res, 'chart.png'), undefined, { caption });
}
