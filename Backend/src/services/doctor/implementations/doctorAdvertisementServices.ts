import { inject,injectable } from "inversify";
import IDoctorAdvertisementService from "../interfaces/IDoctorAdvertisementServices";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";

@injectable()
export default class DoctorAdvertisementService implements IDoctorAdvertisementService {

    constructor(
        @inject("IAdvertisementRepository") private _advertisementRepository : IAdvertisementRepository
    ){};


    async createAdvertisement(addData: any): Promise<any> {
        
    };
    
}