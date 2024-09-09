import { ErrorMessage } from "../../types/shared.types";

export const IMAGES_BASE_PATH = 'resources/images';
export const RABBITMQ_URI = 'amqps://ueqloyeq:9BxZeMxBPbqYtcZkjUwav4ghuFuvXDy6@stingray.rmq.cloudamqp.com/ueqloyeq';

export const DEFAULT_ERROR_MESSAGE: ErrorMessage = {
    error: 'Unknow error. Please debug the application'
} as const;