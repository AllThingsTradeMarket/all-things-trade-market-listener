import { ExchangeOfferStatus } from "../dtos/exchange_offer.dtos";

export type ExchangeOfferCreateResponse = { 
    receiverId: number;
}

export type ExchangeOfferUpdateResponse = {
    status: ExchangeOfferStatus;
    receiverId: number;
    senderId: number;
}

export type ExchangeOfferUpdateRequest = {
    status: ExchangeOfferStatus;
    id: number;
}
