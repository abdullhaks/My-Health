import { Request,Response } from "express";

export default interface IDoctorAuthCtrl{

    doctorLogin(req: Request, res:Response): Promise<any> 
    doctorSignup( req: Request, res: Response ): Promise<any>
    verifyOtp(req: Request, res: Response): Promise<any> 
    resentOtp(req: Request, res: Response): Promise<any> 
}