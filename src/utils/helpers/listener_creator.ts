import { ErrorMessage } from "../../types/shared.types";
import { DEFAULT_ERROR_MESSAGE, RABBITMQ_URI } from "../constants/constants";
import amqp from 'amqplib/callback_api';

export const createListener = <RequestDataType, ResponseDataType>(queues_name: string, 
        requestHandler: (requestData: RequestDataType) => Promise<ResponseDataType | ErrorMessage>) => {
    amqp.connect(RABBITMQ_URI, (err, connection) => {
        if (err) {
            throw new Error('Could not connect to RabbitMQ');
        }

        console.log('Connected to RabbitMQ');

        connection.createChannel((err, channel) => {
            if (err) {
                throw new Error('Could not create channel');
            }

            const queue = queues_name;
            channel.assertQueue(queue, { durable: true });
            console.log(`Waiting for messages in ${queue}`);

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const requestData: RequestDataType = JSON.parse(msg.content.toString());
                    const responseData: ResponseDataType | ErrorMessage = await requestHandler(requestData);
                    // Odesłanie odpowiedzi z powrotem do serwera WWW
                    if ((responseData as ErrorMessage).error === undefined) {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responseData)), {
                            correlationId: msg.properties.correlationId
                        });
                    } else {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responseData)), {
                            correlationId: msg.properties.correlationId
                        });
                    }

                    channel.ack(msg);
                }
            });
        });
    });
};

export const defaultErrorHandlingFunction = (error: unknown): ErrorMessage => {
    if (error instanceof Error){
        return {
            error: error.message
        };
    }
    return DEFAULT_ERROR_MESSAGE;
} 
