import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI } from '../utils/constants/constants';
import { CreateUserDto } from '../dtos/user.dtos';
import { usersDb } from '../models/user.model';
import { queues_names } from '../utils/constants/queues_names';

const processCreateUser = async (user: CreateUserDto) => {
    try {
        const [userId] = await usersDb().insert(user);
        console.log(`User created with ID: ${userId}`);
    } catch (err) {
        console.error('Error creating user:', err);
    }
}

export const connectToUserCreateQueue = () => {
    amqp.connect(RABBITMQ_URI, (err, connection) => {
        if (err) {
            throw new Error('Could not connect to RabbitMQ');
        }
    
        console.log('Connected to RabbitMQ');
    
        connection.createChannel((err, channel) => {
            if (err) {
                throw new Error('Could not create channel');
            }
    
            const queue = queues_names.USER_QUEUE;
            channel.assertQueue(queue, { durable: true });
            console.log(`Waiting for messages in ${queue}`);
    
            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const userData = JSON.parse(msg.content.toString());
                    await processCreateUser(userData);
                    channel.ack(msg);
                }
            });
        });
    });
}
