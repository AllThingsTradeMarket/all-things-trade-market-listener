import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI } from '../utils/constants/constants';
import { queues_names } from '../utils/constants/queues_names';
import { CreateOfferDto } from '../dtos/offer.dtos';
import { imagesDb } from '../models/image.model';
import { createImageAssignments, insertOfferToDb } from '../utils/helpers/offerHelpers/offer.helpers';

const processCreateOffer = async (offer: CreateOfferDto, imagePaths: string[]) => {
    try {
        const imageIds: number[] = [];
        for (let imagePath of imagePaths) {
            const [imageId] = await imagesDb().insert({ path: imagePath });
            imageIds.push(imageId);
        }

        const offerId = await insertOfferToDb(offer);
        if (offerId && !imageIds.some(id => typeof id === 'undefined')) {
            await createImageAssignments({
                offerId: offerId,
                imagesIds: imageIds.map(id => Number(id)),
            });
        }

        return offerId; // Zwróć ID utworzonej oferty
    } catch (err) {
        console.error('Error creating offer:', err);
        return null;
    }
}

export const connectToOfferQueue = () => {
    amqp.connect(RABBITMQ_URI, (err, connection) => {
        if (err) {
            throw new Error('Could not connect to RabbitMQ');
        }

        console.log('Connected to RabbitMQ');

        connection.createChannel((err, channel) => {
            if (err) {
                throw new Error('Could not create channel');
            }

            const queue = queues_names.OFFER_QUEUE;
            channel.assertQueue(queue, { durable: true });
            console.log(`Waiting for messages in ${queue}`);

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const offerData = JSON.parse(msg.content.toString());
                    const offerId = await processCreateOffer(offerData.offer, offerData.imagePaths);

                    // Odesłanie odpowiedzi z powrotem do serwera WWW
                    if (offerId) {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({ offerId })), {
                            correlationId: msg.properties.correlationId
                        });
                    }

                    channel.ack(msg); // Potwierdzenie przetworzenia wiadomości
                }
            });
        });
    });
}
