import {z} from 'zod';
import { db } from '../db/knex';
import { databaseNames } from '../utils/constants/database_names';

const ExchangeRequestedProductsSchema = z.object({
    id: z.number(),
    exchangeOfferId: z.number(),
    offerId: z.number()
});

export type ExchangeRequestedProduct = z.infer<typeof ExchangeRequestedProductsSchema>;
export const exchangeRequestedProductsDb = () => db<ExchangeRequestedProduct>(databaseNames.EXCHANGE_REQUESTED_PRODUCTS);
