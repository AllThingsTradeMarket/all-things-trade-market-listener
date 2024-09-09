import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI } from '../utils/constants/constants';
import { queues_names } from '../utils/constants/queues_names';
import { CreateExchangeOfferDto } from '../dtos/exchange_offer.dtos';
import { createExchangeOfferOfferedProducts, createExchangeOfferRequestedProducts, insertExchangeOfferToDb } from '../utils/helpers/exchangeOfferHelpers/exchange_offer.helpers';
import { isEmpty } from 'lodash';

const processCreateExchangeOffer = async (exchangeOfferRequest: CreateExchangeOfferDto) => {
    try {
        const exchangeOfferId = await insertExchangeOfferToDb(exchangeOfferRequest);
        if (exchangeOfferId === -1) {
            throw Error('Could not create the exchange offer');
        }
        console.log(`created with id: ${exchangeOfferId}`);
        if (!isEmpty(exchangeOfferRequest.offeredProductsIds)) {
            await createExchangeOfferOfferedProducts(exchangeOfferId, exchangeOfferRequest.offeredProductsIds!);
        }
        await createExchangeOfferRequestedProducts(exchangeOfferId, exchangeOfferRequest.requestedProductsIds);
        console.log('Succesfully created exchange offer! With proper assignments')
        return exchangeOfferRequest.receiverId;
    } catch (err) {
        console.error('Error creating exchange offer:', err);
        return err;
    }
}

export const connectToExchangeOfferQueue = () => {
    amqp.connect(RABBITMQ_URI, (err, connection) => {
        if (err) {
            throw new Error('Could not connect to RabbitMQ');
        }

        console.log('Connected to RabbitMQ');

        connection.createChannel((err, channel) => {
            if (err) {
                throw new Error('Could not create channel');
            }

            const queue = queues_names.EXCHANGE_OFFER_QUEUE;
            channel.assertQueue(queue, { durable: true });
            console.log(`Waiting for messages in ${queue}`);

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const exchangeOfferData = JSON.parse(msg.content.toString());
                    const exchangeOfferReceiverId = await processCreateExchangeOffer(exchangeOfferData);
                    if (exchangeOfferReceiverId) {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(
                            { receiverId: exchangeOfferReceiverId }
                        )), {
                            correlationId: msg.properties.correlationId
                        });
                    }
                    channel.ack(msg);
                }
            });
        });
    });
}
