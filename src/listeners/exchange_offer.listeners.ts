import { queues_names } from '../utils/constants/queues_names';
import { CreateExchangeOfferDto } from '../dtos/exchange_offer.dtos';
import { createExchangeOfferOfferedProducts, createExchangeOfferRequestedProducts, insertExchangeOfferToDb } from '../utils/helpers/exchangeOfferHelpers/exchange_offer.helpers';
import { isEmpty } from 'lodash';
import { ErrorMessage } from '../types/shared.types';
import { ExchangeOfferCreateResponse, ExchangeOfferUpdateRequest, ExchangeOfferUpdateResponse } from '../types/exchange_offer.types';
import { createListener, defaultErrorHandlingFunction } from '../utils/helpers/listener_creator';
import { exchangeOffersDb } from '../models/exchange_offer.model';

const processCreateExchangeOffer = async (exchangeOfferRequest: CreateExchangeOfferDto): Promise<ExchangeOfferCreateResponse | ErrorMessage> => {
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
        return {
            receiverId: exchangeOfferRequest.receiverId
        };
    } catch (err) {
        console.error('Error creating exchange offer:', err);
        return defaultErrorHandlingFunction(err);
    }
};

export const connectToExchangeOfferQueue = () => {
    createListener<CreateExchangeOfferDto, ExchangeOfferCreateResponse>(queues_names.EXCHANGE_OFFER_QUEUE, processCreateExchangeOffer);
};

const processExchangeOfferUpdate = async (updateExchangeOfferRequest: ExchangeOfferUpdateRequest): Promise<ExchangeOfferUpdateResponse | ErrorMessage> => {
    try {
        const result = await exchangeOffersDb()
            .where({ id: updateExchangeOfferRequest.id })
            .update({ status: updateExchangeOfferRequest.status })
            .returning('*');

        if (result.length === 0) {
            throw Error('404: Exchange offer not found');
        }

        const updatedOffer = result[0];

        return {
            status: updateExchangeOfferRequest.status,
            receiverId: updatedOffer.receiverId,
            senderId: updatedOffer.senderId
        };
    } catch (error) {
        console.log(error);
        return defaultErrorHandlingFunction(error);
    }
    
};

export const connectToExchangeOfferUpdateQueue = () => {
    createListener<ExchangeOfferUpdateRequest, ExchangeOfferUpdateResponse>(queues_names.EXCHANGE_OFFER_UPDATE_QUEUE, processExchangeOfferUpdate);
};
