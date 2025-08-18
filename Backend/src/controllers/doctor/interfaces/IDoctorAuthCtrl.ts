import { Request,Response,NextFunction } from "express";

export default interface IDoctorAuthCtrl{

    doctorLogin(req: Request, res:Response,next:NextFunction): Promise<void> 
    refreshToken(req: Request, res: Response,next:NextFunction): Promise<void>
    getRefreshToken(req:Request , res:Response , next:NextFunction):Promise<void>
    doctorSignup( req: Request, res: Response ,next:NextFunction): Promise<void>
    verifyOtp(req: Request, res: Response,next:NextFunction): Promise<void> 
    resentOtp(req: Request, res: Response,next:NextFunction): Promise<void> 
}