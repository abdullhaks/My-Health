import BaseRepository from "../implementations/baseRepository";
import { IAdvertisementDocument } from "../../entities/advertisementEntitites";

export default interface IAdvertisementRepository extends BaseRepository<IAdvertisementDocument>{
    
    getAdds(doctorId:string,pageNumber: number,limitNumber: number): Promise<any>
    getAdvertisementsByTimePeriodAndTags(startDate: Date,tags:string[],latitude:number,longitude:number): Promise<IAdvertisementDocument[]>;

}