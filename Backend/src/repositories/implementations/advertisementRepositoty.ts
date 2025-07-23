import BaseRepository from "./baseRepository";
import IAdvertisementRepository from "../interfaces/IAdvertisementRepository";
import { IAdvertisementDocument } from "../../entities/advertisementEntitites";
import { inject,injectable } from "inversify";


@injectable()
export default class AdvertisementRepository extends BaseRepository<IAdvertisementDocument> implements IAdvertisementRepository{

    constructor(
        @inject("advertisementModel") private _advertisementModel:any
    ){
        super(_advertisementModel)
    };

    async getAdds(doctorId:string,pageNumber: number,limitNumber: number): Promise<any> {
        try {
            const query: any = {authorId:doctorId};

            const skip = (pageNumber - 1) * limitNumber;

            const adds = await this._advertisementModel
                .find(query)
                .skip(skip)
                .limit(limitNumber);

                const total = await this._advertisementModel.countDocuments(query);
            return {
                adds,
                totalPages: Math.ceil(total / limitNumber),
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch users");
        }
    };

}