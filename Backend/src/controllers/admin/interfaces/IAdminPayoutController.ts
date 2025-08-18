import { Request,Response } from "express";


export default interface IAdminPayoutController {

    getPayouts(req: Request, res: Response): Promise<void>,
   
    updatePayout(req: Request, res: Response): Promise<void>,
    
};

