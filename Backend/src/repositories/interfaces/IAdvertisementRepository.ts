import BaseRepository from "../implementations/baseRepository";
import { IAdvertisementDocument } from "../../entities/advertisementEntitites";
interface IGetAddsResponse {
    adds: IAdvertisementDocument[];
    totalPages: number;
}

export default interface IAdvertisementRepository extends BaseRepository<IAdvertisementDocument>{
    
    getAdds(doctorId:string,pageNumber: number,limitNumber: number): Promise<IGetAddsResponse>
    getAdvertisementsByTimePeriodAndTags(startDate: Date,tags:string[],latitude:number,longitude:number): Promise<IAdvertisementDocument[]>;

}