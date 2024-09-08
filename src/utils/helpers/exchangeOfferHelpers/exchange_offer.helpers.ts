import { isEmpty } from "lodash";
import { ExchangeOffer, exchangeOffersDb } from "../../../models/exchange_offer.model";
import { exchangeOfferedProductsDb } from "../../../models/exchange_offered_products.model";
import { exchangeRequestedProductsDb } from "../../../models/exchange_requested_products.model";
import { CreateExchangeOfferDto } from "../../../dtos/exchange_offer.dtos";
import { formatDateToDDMMYYYY } from "../helpers";
import { exchangeStatusses } from "../../constants/exchange_statusses";

export const insertExchangeOfferToDb = async (exchangeOfferRequest: CreateExchangeOfferDto) => {
    try {
        const [exchangeOfferId] = await exchangeOffersDb().insert(
            {
                receiverId: exchangeOfferRequest.receiverId,
                senderId: exchangeOfferRequest.senderId,
                date: formatDateToDDMMYYYY(new Date()),
                status: exchangeStatusses.PENDING,
                offeredCash: exchangeOfferRequest.offeredCash
            }
        );
        return exchangeOfferId;
    } catch(error) {
        console.error(error);
        return -1;        
    }
};


export const createExchangeOfferRequestedProducts = async (exchangeId: number, requestedProductsIds: number[]) => {
    for (let productId of requestedProductsIds) {
        await exchangeRequestedProductsDb().insert({
            exchangeOfferId: exchangeId,
            offerId: productId
        });
    }
};

export const createExchangeOfferOfferedProducts = async (exchangeId: number, offeredProductsIds: number[]) => {
    for (let productId of offeredProductsIds) {
        await exchangeOfferedProductsDb().insert({
            exchangeOfferId: exchangeId,
            offerId: productId
        });
    }
};
