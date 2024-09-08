import { formatDateToDDMMYYYY } from "../helpers";
import { CreateOfferDto } from "../../../dtos/offer.dtos";
import { offersDb } from "../../../models/offer.model";
import { CreateImageAssignmentDto } from "../../../dtos/image_assignment.dtos";
import { imageAssignmentsDb } from "../../../models/images_assignments.model";
import { isEmpty } from "lodash";

export const insertOfferToDb = async (offer: CreateOfferDto) => {
    const [offerId] = await offersDb().insert({
        dateCreated: formatDateToDDMMYYYY(new Date()),
        userId: offer.userId,
        title: offer.title,
        description: offer.description,
        price: offer.price
    });
    return offerId;
};

export const createImageAssignments = async (assignment: CreateImageAssignmentDto) => {
    const imagesIds = assignment.imagesIds;
    if (!isEmpty(imagesIds) && assignment.offerId) {
        for (const imageId of imagesIds) {
            await imageAssignmentsDb().insert({
                imageId,
                offerId: assignment.offerId
            });
        }
    }
};