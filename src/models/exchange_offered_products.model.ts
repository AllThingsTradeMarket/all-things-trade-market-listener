import {z} from 'zod';
import { db } from '../db/knex';
import { databaseNames } from '../utils/constants/database_names';

const ExchangeOfferedProductsSchema = z.object({
    id: z.number(),
    exchangeOfferId: z.number(),
    offerId: z.number()
});

export type ExchangeOfferedProduct = z.infer<typeof ExchangeOfferedProductsSchema>;
export const exchangeOfferedProductsDb = () => db<ExchangeOfferedProduct>(databaseNames.EXCHANGE_OFFERED_PRODUCTS);
