import { queues_names } from '../utils/constants/queues_names';
import { imagesDb } from '../models/image.model';
import { createImageAssignments, insertOfferToDb } from '../utils/helpers/offerHelpers/offer.helpers';
import { createListener, defaultErrorHandlingFunction } from '../utils/helpers/listener_creator';
import { OfferCreateRequest, OfferCreateResponse } from '../types/offer.types';
import { ErrorMessage } from '../types/shared.types';

const processCreateOffer = async (offerCreateRequest: OfferCreateRequest): Promise<OfferCreateResponse | ErrorMessage> => {
    try {
        const imageIds: number[] = [];
        for (let imagePath of offerCreateRequest.imagePaths) {
            const [imageId] = await imagesDb().insert({ path: imagePath });
            imageIds.push(imageId);
        }

        const offerId = await insertOfferToDb(offerCreateRequest.offer);
        if (offerId && !imageIds.some(id => typeof id === 'undefined')) {
            await createImageAssignments({
                offerId: offerId,
                imagesIds: imageIds.map(id => Number(id)),
            });
        }

        return { offerId };
    } catch (err) {
        console.error('Error creating offer:', err);
        return defaultErrorHandlingFunction(err);
    }
}

export const connectToOfferQueue = () => {
    createListener<OfferCreateRequest, OfferCreateResponse>(queues_names.OFFER_QUEUE, processCreateOffer);
}
