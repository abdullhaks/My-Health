import { Request,Response,NextFunction } from "express";

export default interface IDoctorAuthCtrl{

    doctorLogin(req: Request, res:Response,next:NextFunction): Promise<any> 
    refreshToken(req: Request, res: Response,next:NextFunction): Promise<any>
    doctorSignup( req: Request, res: Response ,next:NextFunction): Promise<any>
    verifyOtp(req: Request, res: Response,next:NextFunction): Promise<any> 
    resentOtp(req: Request, res: Response,next:NextFunction): Promise<any> 
}