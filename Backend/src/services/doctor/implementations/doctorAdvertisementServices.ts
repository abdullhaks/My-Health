import { inject,injectable } from "inversify";
import IDoctorAdvertisementService from "../interfaces/IDoctorAdvertisementServices";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";
import { IAdvertisement } from "../../../dto/advertisementDto";

interface IGetAddsResponse {
    adds: IAdvertisement[];
    totalPages: number;
}


@injectable()
export default class DoctorAdvertisementService implements IDoctorAdvertisementService {

    constructor(
        @inject("IAdvertisementRepository") private _advertisementRepository : IAdvertisementRepository
    ){};


    async createAdvertisement(addData: any): Promise<IAdvertisement> {

        if(addData.tags.length){
            addData.tags= addData.tags.map((item:string)=>item.toLowerCase());
        }
        const response = await this._advertisementRepository.create(addData);
        return response;

    };

    async getAdds(doctorId:string,pageNumber: number, limitNumber: number): Promise<IGetAddsResponse> {
        
        const response = await this._advertisementRepository.getAdds(doctorId,pageNumber,limitNumber);
        console.log("blog response....",response)
        return response;
    }
    
}