import { CreateOfferDto } from "../dtos/offer.dtos";

export type OfferCreateRequest = {
    offer: CreateOfferDto; 
    imagePaths: string[];
};

export type OfferCreateResponse = {
    offerId: number;
}