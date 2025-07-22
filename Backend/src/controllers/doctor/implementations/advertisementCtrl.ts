import { inject,injectable } from "inversify";
import IDoctorAdvertisementController from "../interfaces/IAdvertisementCtrl";
import { Request, Response } from "express";


@injectable()
export default class DoctorAdvertisementController implements IDoctorAdvertisementController {

    constructor(
        @inject("") private _advertisementService : any
    ){};

    async createAdvertisement(req: Request, res: Response): Promise<any> {
        
    };

    
}