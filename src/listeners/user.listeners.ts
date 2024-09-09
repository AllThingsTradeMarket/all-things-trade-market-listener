import { CreateUserDto } from '../dtos/user.dtos';
import { usersDb } from '../models/user.model';
import { queues_names } from '../utils/constants/queues_names';
import { ErrorMessage } from '../types/shared.types';
import { createListener, defaultErrorHandlingFunction } from '../utils/helpers/listener_creator';

const processCreateUser = async (user: CreateUserDto): Promise<{id: number} | ErrorMessage> => {
    try {
        const [userId] = await usersDb().insert(user);
        console.log(`User created with ID: ${userId}`);
        return { 
            id: userId
        };
    } catch (err) {
        console.error('Error creating user:', err);
        return defaultErrorHandlingFunction(err);
    }
};

export const connectToUserCreateQueue = () => {
   createListener<CreateUserDto, {id: number}>(queues_names.USER_QUEUE, processCreateUser);
};
