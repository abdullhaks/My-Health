import {Request,Response} from "express";


export default interface IDoctorAdvertisementController {

    createAdvertisement (req:Request,res:Response):Promise<void>;
    getAdds(req: Request, res: Response): Promise<void>;

}