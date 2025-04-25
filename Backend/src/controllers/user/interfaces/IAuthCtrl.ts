import { NextFunction,Request,Response } from "express";

export default interface IUserAuthCtrl{
    userLogin(req:Request,res:Response):Promise<void>

    userLogout(req:Request,res:Response):Promise<any>

    userSignup(req:Request,res:Response,next:NextFunction):Promise<void>

    verifyOtp(req:Request,res:Response):Promise<void>

    resentOtp(req:Request,res:Response):Promise<void>

    forgotPassword(req:Request,res:Response):Promise<void>
    
    getRecoveryPassword(req:Request,res:Response):Promise<void>

    verifyRecoveryPassword(req:Request,res:Response):Promise<void>

    resetPassword(req:Request,res:Response):Promise<void>

    refreshToken(req:Request,res:Response):Promise<void>


}