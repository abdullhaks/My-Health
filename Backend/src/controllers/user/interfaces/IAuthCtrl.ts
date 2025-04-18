import { NextFunction,Request,Response } from "express";

export default interface IAuthCtrl{
    userLogin(req:Request,res:Response):Promise<void>

    userSignup(req:Request,res:Response,next:NextFunction):Promise<void>

    verifyOtp(req:Request,res:Response):Promise<void>

    resentOtp(req:Request,res:Response):Promise<void>

    getRecoveryPassword(req:Request,res:Response):Promise<void>

    resetPassword(req:Request,res:Response):Promise<void>

    


}