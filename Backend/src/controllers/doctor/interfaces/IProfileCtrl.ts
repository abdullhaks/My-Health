import { Request,Response } from "express";

export default interface IDoctorProfileCtrl{

createCheckoutSession (req: Request, res: Response):Promise<void>
verifyingSubscription(req: Request, res: Response): Promise<void>
updateDp (req:Request,res:Response):Promise<void>
updateProfile(req: Request, res: Response): Promise<void> 

}