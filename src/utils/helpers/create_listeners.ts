import { connectToExchangeOfferQueue } from "../../listeners/exchange_offer.listeners";
import { connectToOfferQueue } from "../../listeners/offer.listeners";
import { connectToUserCreateQueue } from "../../listeners/user.listeners"

export const connectToQueues = () => {
  connectToUserCreateQueue();
  connectToOfferQueue();
  connectToExchangeOfferQueue();  
}
