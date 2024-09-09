import { exchangeStatusses } from "../utils/constants/exchange_statusses";

export type ExchangeOfferStatus = typeof exchangeStatusses[keyof typeof exchangeStatusses];

export type CreateExchangeOfferDto = {
    senderId: number;
    receiverId: number;
    offeredCash?: number;
    offeredProductsIds?: number[];
    requestedProductsIds: number[];
};

export type UpdateExchangeOfferDto = {
    status: ExchangeOfferStatus
};