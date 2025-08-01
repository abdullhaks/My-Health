import BaseRepository from "../implementations/baseRepository";
import { IAdvertisementDocument } from "../../entities/advertisementEntitites";

export default interface IAdvertisementRepository extends BaseRepository<IAdvertisementDocument>{
    
    getAdds(doctorId:string,pageNumber: number,limitNumber: number): Promise<any>
    getAdvertisementsByTimePeriod(startDate: Date): Promise<IAdvertisementDocument[]>;

}