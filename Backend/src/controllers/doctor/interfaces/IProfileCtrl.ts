import { Request,Response } from "express";

export default interface IDoctorProfileCtrl{

createCheckoutSession (req: Request, res: Response):Promise<any>
verifyingSubscription(req: Request, res: Response): Promise<any>
updateDp (req:Request,res:Response):Promise<any>

}