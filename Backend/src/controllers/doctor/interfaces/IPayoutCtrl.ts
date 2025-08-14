import { Request,Response } from "express";


export default interface IDoctorPayoutController {

    requestPayout(req:Request,res:Response):Promise<void>
    getPayouts(req: Request, res: Response): Promise<void>,
   

    
};

