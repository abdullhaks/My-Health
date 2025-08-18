import { Request,Response } from "express";


export default interface IDoctorPayoutCtrl {

    requestPayout(req:Request,res:Response):Promise<void>
    getPayouts(req: Request, res: Response): Promise<void>,
   

    
};

