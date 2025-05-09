import { Request,Response } from "express";

export default interface IDoctorProfileCtrl{

createCheckoutSession (req: Request, res: Response):Promise<any>

}