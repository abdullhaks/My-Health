import { inject,injectable } from "inversify";
import IDoctorAdvertisementService from "../interfaces/IDoctorAdvertisementServices";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";

@injectable()
export default class DoctorAdvertisementService implements IDoctorAdvertisementService {

    constructor(
        @inject("IAdvertisementRepository") private _advertisementRepository : IAdvertisementRepository
    ){};


    async createAdvertisement(addData: any): Promise<any> {

        const response = await this._advertisementRepository.create(addData);
        return response;

    };

    async getAdds(doctorId:string,pageNumber: number, limitNumber: number): Promise<any> {
        
        const response = await this._advertisementRepository.getAdds(doctorId,pageNumber,limitNumber);
        console.log("blog response....",response)
        return response;
    }
    
}